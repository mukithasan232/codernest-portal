'use server';

/**
 * CRM Lead Creation & Direct Outreach Dispatcher Action
 * File: src/lib/actions/crm-lead.actions.ts
 *
 * 1. Validates prospect data with Zod
 * 2. Upserts Lead in Prisma with status: 'contacted'
 * 3. Enqueues personalized cold outreach email via QStash background worker
 * 4. Logs delivery in EmailTrackingLog
 * 5. Wires lead into Upstash 48h onboarding workflow (triggerOnboardingWorkflow)
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { enqueueEmail } from '@/lib/qstash';
import { triggerOnboardingWorkflow } from '@/lib/workflow';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const quickOutreachSchema = z.object({
  name: z.string().min(1, 'Lead name is required'),
  email: z.string().email('Valid business email is required'),
  company: z.string().optional().nullable(),
  roleOrContext: z.string().optional().nullable(),
  subject: z.string().min(1, 'Email subject is required'),
  messageBody: z.string().min(1, 'Message body is required'),
  leadSource: z.string().default('Manual / Outreach'),
});

export type QuickOutreachInput = z.infer<typeof quickOutreachSchema>;

export interface QuickOutreachResult {
  success: boolean;
  leadId?: string;
  lead?: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: string;
    source: string;
    createdAt: Date;
    updatedAt: Date;
  };
  queuedEmail?: boolean;
  error?: string;
}

/**
 * Wraps plaintext email body into a sleek, branded CoderNest dark/light HTML template
 */
function formatOutreachHtml(name: string, company: string | null, messageBody: string): string {
  // Convert newlines into paragraphs or line breaks
  const paragraphs = messageBody
    .split(/\n\n+/)
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #334155; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px 12px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; background: #ffffff; }
    .brand { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .brand span { color: #2563eb; }
    .body { padding: 32px; }
    .footer { padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">CoderNest<span>.</span></div>
    </div>
    <div class="body">
      ${paragraphs}
    </div>
    <div class="footer">
      <strong>CoderNest Digital Solutions</strong> &bull; Enterprise Full-Stack & Next.js Specialists<br/>
      Flagship Systems: MedOS &bull; SMM Elite &bull; CoderNest Cinema &bull; DevVibe<br/>
      <a href="https://codernest.agency" style="color: #2563eb; text-decoration: none;">https://codernest.agency</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function createLeadAndDispatchOutreach(
  input: QuickOutreachInput
): Promise<QuickOutreachResult> {
  try {
    // 1. Authenticate Admin/Staff Session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Unauthorized. Please sign in to the Admin Portal.' };
    }

    // 2. Validate Input
    const parsed = quickOutreachSchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation error';
      return { success: false, error: firstError };
    }

    const { name, email, company, roleOrContext, subject, messageBody, leadSource } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanCompany = company?.trim() || null;

    const outreachNote = `[Direct Cold Outreach - ${new Date().toLocaleDateString()}]\nContext: ${roleOrContext || 'Direct Outreach'}\nSubject: ${subject}\n\n${messageBody}`;

    // 3. Upsert Lead in Prisma
    let lead = await prisma.lead.findFirst({
      where: { email: cleanEmail },
    });

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: cleanName,
          company: cleanCompany || lead.company,
          status: 'contacted',
          message: lead.message ? `${lead.message}\n\n---\n${outreachNote}` : outreachNote,
          serviceRequested: roleOrContext || lead.serviceRequested || 'Custom Software Development',
          updatedAt: new Date(),
        },
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          company: cleanCompany,
          status: 'contacted',
          source: leadSource || 'Manual / Outreach',
          serviceRequested: roleOrContext || 'Custom Software Development',
          message: outreachNote,
        },
      });
    }

    // 4. Dispatch Email via QStash Queue (Non-blocking background delivery)
    const emailHtml = formatOutreachHtml(cleanName, cleanCompany, messageBody);

    const queueResult = await enqueueEmail({
      to: cleanEmail,
      subject,
      html: emailHtml,
      text: messageBody,
      leadId: lead.id,
      clientName: cleanName,
      companyName: cleanCompany || undefined,
      type: 'onboarding',
    });

    // 5. Create or Find Outreach Campaign & Record EmailTrackingLog
    try {
      let outreachCampaign = await prisma.campaign.findFirst({
        where: { name: 'Admin CRM Direct Outreach' },
      });

      if (!outreachCampaign) {
        outreachCampaign = await prisma.campaign.create({
          data: {
            name: 'Admin CRM Direct Outreach',
            subject: 'Direct CRM Cold Outreach',
            totalSent: 1,
          },
        });
      } else {
        await prisma.campaign.update({
          where: { id: outreachCampaign.id },
          data: { totalSent: { increment: 1 } },
        });
      }

      await prisma.emailTrackingLog.create({
        data: {
          campaignId: outreachCampaign.id,
          leadId: lead.id,
          status: 'SENT',
        },
      });
    } catch (logErr) {
      console.warn('[CRM Outreach] Could not record tracking log:', logErr);
    }

    // 6. Trigger Upstash Onboarding Workflow (48-hour follow-up pipeline)
    triggerOnboardingWorkflow({
      leadId: lead.id,
      email: cleanEmail,
      name: cleanName,
      company: cleanCompany,
      source: lead.source,
      serviceRequested: lead.serviceRequested,
    }).catch((wfErr) => {
      console.error('[CRM Outreach] Failed to trigger onboarding workflow:', wfErr);
    });

    // Revalidate CRM Leads paths
    revalidatePath('/admin/leads');
    revalidatePath('/admin/crm');

    return {
      success: true,
      leadId: lead.id,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: lead.status,
        source: lead.source,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
      queuedEmail: queueResult.success,
    };
  } catch (error: unknown) {
    console.error('[createLeadAndDispatchOutreach Error]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save lead and dispatch outreach.',
    };
  }
}
