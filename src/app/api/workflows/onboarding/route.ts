/**
 * Upstash Workflow: Multi-Step Client Onboarding & Automated CRM Outreach
 * File: src/app/api/workflows/onboarding/route.ts
 *
 * Durable serverless workflow managing automated lead onboarding:
 * 1. Ingests new lead or broadcast recipient
 * 2. Dispatches initial technical outreach email via SMTP & updates CRM to 'contacted'
 * 3. Suspends execution with durable sleep for 2 days (context.sleep('wait-for-reply', '2d'))
 * 4. Queries Prisma to check if the lead replied or progressed down the CRM pipeline
 * 5. Dispatches tailored technical follow-up and updates CRM to 'followup_sent' if no response
 */

import { serve } from '@upstash/workflow/nextjs';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { getAppBaseUrl, qstashReceiver } from '@/lib/qstash';

export interface OnboardingWorkflowPayload {
  leadId?: string;
  email: string;
  name: string;
  company?: string | null;
  serviceRequested?: string | null;
  source?: string | null;
  budget?: string | null;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  siteName: string;
  isMock: boolean;
}

/**
 * Loads system SMTP settings or falls back to environment variables / mock
 */
async function loadSmtpConfig(): Promise<SmtpConfig> {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global_settings' },
  });

  const host = settings?.smtpHost || process.env.SMTP_HOST || '';
  const port = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '465', 10);
  const user = settings?.smtpUser || process.env.SMTP_USER || '';
  const pass = settings?.smtpPassword || process.env.SMTP_PASS || '';
  const siteName = settings?.siteName || 'CoderNest Digital Solutions';

  const isMock =
    !host ||
    !user ||
    !pass ||
    host.includes('example.com') ||
    host.includes('mock');

  return { host, port, user, pass, siteName, isMock };
}

export const { POST } = serve<OnboardingWorkflowPayload>(
  async (context) => {
    // ─── STEP 1: Receive newly captured lead or broadcast recipient ────────────
    const leadData = await context.run('step-1-receive-lead', async () => {
      const payload = context.requestPayload;

      if (!payload || !payload.email) {
        throw new Error('Invalid onboarding payload: "email" is strictly required.');
      }

      const clientName = payload.name?.trim() || 'Partner';
      const companyName = payload.company?.trim() || 'your team';
      const service = payload.serviceRequested?.trim() || 'Custom Full-Stack Development';

      return {
        leadId: payload.leadId,
        email: payload.email.trim().toLowerCase(),
        name: clientName,
        company: companyName,
        serviceRequested: service,
        source: payload.source || 'Direct Portal Ingestion',
        budget: payload.budget || 'Custom Scope',
      };
    });

    // ─── STEP 2: Automatically trigger initial outreach email ──────────────────
    const initialEmailResult = await context.run('step-2-send-initial-outreach', async () => {
      const smtp = await loadSmtpConfig();
      const appUrl = getAppBaseUrl();

      const subject = `Welcome to CoderNest — Architecture & Engineering for ${leadData.name}`;

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px; border-bottom: 1px solid #312e81; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; border-radius: 9999px; color: #60a5fa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3; }
    .body { padding: 32px; color: #cbd5e1; font-size: 15px; line-height: 1.65; }
    .highlight-card { background: #1f2937; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .highlight-title { font-weight: 600; color: #ffffff; margin-bottom: 6px; font-size: 14px; }
    .tech-pill { display: inline-block; background: #374151; color: #93c5fd; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin: 2px 4px 2px 0; }
    .cta-btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 24px 0 8px 0; }
    .footer { padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">CoderNest Engineering</div>
      <h1 class="title">Engineering High-Performance Solutions</h1>
    </div>
    <div class="body">
      <p>Hi ${leadData.name},</p>
      <p>Thank you for reaching out to <strong>CoderNest Digital Solutions</strong>. We have received your inquiry regarding <strong>${leadData.serviceRequested}</strong>.</p>
      
      <p>At CoderNest, our senior full-stack team builds enterprise-grade, highly scalable software platforms utilizing Next.js App Router, TypeScript, Prisma ORM, and high-availability cloud infrastructure.</p>

      <div class="highlight-card">
        <div class="highlight-title">Proven Flagship Engineering Projects:</div>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
          • <strong>MedOS:</strong> Comprehensive Hospital Management System with sub-second patient records and role-based workflows.<br/>
          • <strong>SMM Elite:</strong> High-throughput automated digital services marketplace with distributed job queuing.<br/>
          • <strong>CoderNest Cinema:</strong> High-performance media indexing platform featuring sub-100ms discovery.
        </p>
        <div>
          <span class="tech-pill">Next.js</span>
          <span class="tech-pill">TypeScript</span>
          <span class="tech-pill">PostgreSQL / MongoDB</span>
          <span class="tech-pill">Upstash QStash</span>
        </div>
      </div>

      <p>We would love to discuss your technical architecture, project scope, and release timeline. Simply reply directly to this email or book an exploratory consultation below:</p>

      <a href="${appUrl}/contact" class="cta-btn">Schedule Architecture Consultation &rarr;</a>

      <p style="margin-top: 24px;">Best regards,<br/><strong>The CoderNest Engineering Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CoderNest Digital Solutions. All rights reserved.<br/>
      Sent from our automated onboarding infrastructure. You are receiving this because you initiated an inquiry with CoderNest.
    </div>
  </div>
</body>
</html>
      `;

      if (smtp.isMock) {
        console.log('\n================ [WORKFLOW MOCK OUTREACH] ================');
        console.log(`To: ${leadData.email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Service: ${leadData.serviceRequested}`);
        console.log('==========================================================\n');
      } else {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465,
          auth: { user: smtp.user, pass: smtp.pass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: `"${smtp.siteName}" <${smtp.user}>`,
          to: leadData.email,
          subject,
          html: emailHtml,
        });
      }

      // Update lead status in Prisma CRM if record exists
      if (leadData.leadId) {
        await prisma.lead.update({
          where: { id: leadData.leadId },
          data: {
            status: 'contacted',
            updatedAt: new Date(),
          },
        }).catch((err) => {
          console.error('[Workflow Step 2] Failed to update lead status to contacted:', err);
        });
      } else {
        // Find lead by email and update status
        const found = await prisma.lead.findFirst({
          where: { email: leadData.email },
        });
        if (found) {
          await prisma.lead.update({
            where: { id: found.id },
            data: {
              status: 'contacted',
              updatedAt: new Date(),
            },
          }).catch((err) => {
            console.error('[Workflow Step 2] Failed to update lead status by email:', err);
          });
        }
      }

      return {
        success: true,
        dispatchedAt: new Date().toISOString(),
        recipient: leadData.email,
      };
    });

    // ─── STEP 3: Wait 2 days (Durable serverless sleep via QStash) ─────────────
    await context.sleep('wait-for-reply', '2d');

    // ─── STEP 4: Check database to see if lead replied or moved down CRM pipeline
    const crmStatus = await context.run('step-4-check-crm-pipeline', async () => {
      const lead = await prisma.lead.findFirst({
        where: {
          OR: [
            ...(leadData.leadId ? [{ id: leadData.leadId }] : []),
            { email: leadData.email },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          hasNewReply: true,
          lastReplySnippet: true,
          serviceRequested: true,
        },
      });

      if (!lead) {
        return {
          shouldFollowUp: false,
          reason: 'Lead record no longer exists in database.',
          leadId: null,
          status: null,
        };
      }

      // If lead has replied or moved further along in the pipeline, skip follow-up
      const hasReplied = Boolean(lead.hasNewReply);
      const isProgressed = [
        'qualified',
        'proposal_sent',
        'in_discussion',
        'converted',
        'closed',
        'followup_sent',
      ].includes(lead.status.toLowerCase());

      if (hasReplied || isProgressed) {
        return {
          shouldFollowUp: false,
          reason: `Lead is actively engaged or advanced (status: "${lead.status}", hasNewReply: ${hasReplied}).`,
          leadId: lead.id,
          status: lead.status,
        };
      }

      return {
        shouldFollowUp: true,
        reason: 'Lead has not replied after 48 hours; proceed with follow-up.',
        leadId: lead.id,
        status: lead.status,
      };
    });

    // ─── STEP 5: If no reply, automatically send follow-up email & update CRM stage
    if (crmStatus.shouldFollowUp && crmStatus.leadId) {
      await context.run('step-5-send-followup-outreach', async () => {
        const smtp = await loadSmtpConfig();
        const appUrl = getAppBaseUrl();

        const followUpSubject = `Following up on your software roadmap — CoderNest Engineering`;

        const followUpHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 32px 16px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 28px 32px; border-bottom: 1px solid #312e81; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 9999px; color: #34d399; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; line-height: 1.3; }
    .body { padding: 32px; color: #cbd5e1; font-size: 15px; line-height: 1.65; }
    .quote-box { background: #1f2937; border-left: 4px solid #10b981; border-radius: 6px; padding: 14px 16px; margin: 20px 0; font-size: 14px; color: #e2e8f0; }
    .cta-btn { display: inline-block; background: #059669; color: #ffffff !important; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0 8px 0; }
    .footer { padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">48-Hour Technical Check-In</div>
      <h1 class="title">Checking In on Your Project Roadmap</h1>
    </div>
    <div class="body">
      <p>Hi ${leadData.name},</p>
      <p>I wanted to follow up on our previous note regarding your software requirements for <strong>${leadData.serviceRequested}</strong>.</p>
      
      <p>We know how critical fast turnarounds and robust engineering architectures are. When building mission-critical platforms like <strong>MedOS</strong> (Hospital Management) and <strong>SMM Elite</strong> (Automated Digital Marketplace), our technical roadmap planning phase allowed clients to cut development overhead by over 40%.</p>

      <div class="quote-box">
        Would a brief 15-minute architecture discussion this week help you evaluate timelines, tech stack recommendations, and estimates?
      </div>

      <p>You can reply directly to this email with any scope documents, or select a slot that fits your schedule:</p>

      <a href="${appUrl}/contact" class="cta-btn">Book Technical Discovery Session &rarr;</a>

      <p style="margin-top: 24px;">Best regards,<br/><strong>The CoderNest Engineering Team</strong><br/><span style="color: #64748b; font-size: 13px;">Enterprise Full-Stack & Next.js Specialists</span></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CoderNest Digital Solutions. All rights reserved.<br/>
      Sent from our automated client onboarding pipeline.
    </div>
  </div>
</body>
</html>
        `;

        if (smtp.isMock) {
          console.log('\n================ [WORKFLOW MOCK FOLLOW-UP] ================');
          console.log(`To: ${leadData.email}`);
          console.log(`Subject: ${followUpSubject}`);
          console.log('===========================================================\n');
        } else {
          const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            auth: { user: smtp.user, pass: smtp.pass },
            tls: { rejectUnauthorized: false },
          });

          await transporter.sendMail({
            from: `"${smtp.siteName}" <${smtp.user}>`,
            to: leadData.email,
            subject: followUpSubject,
            html: followUpHtml,
          });
        }

        // Update lead status to 'followup_sent' in CRM
        await prisma.lead.update({
          where: { id: crmStatus.leadId! },
          data: {
            status: 'followup_sent',
            updatedAt: new Date(),
          },
        });

        return {
          sent: true,
          followUpSentAt: new Date().toISOString(),
          leadId: crmStatus.leadId,
        };
      });
    } else {
      await context.run('step-5-skip-followup', async () => {
        return {
          skipped: true,
          reason: crmStatus.reason,
        };
      });
    }

    return {
      workflow: 'onboarding-completed',
      leadEmail: leadData.email,
      initialOutreach: initialEmailResult,
      crmEvaluation: crmStatus,
    };
  },
  {
    baseUrl: process.env.QSTASH_NEXT_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.agency',
    receiver: qstashReceiver || undefined,
  }
);
