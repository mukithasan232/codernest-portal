import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { enqueueBulkEmails, EmailJobPayload } from '@/lib/qstash';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const session = await getServerSession();
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    const isAuthorized =
      Boolean(session) ||
      (webhookSecret && authHeader === `Bearer ${webhookSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized broadcast request' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, body: emailTemplate, audience, leadIds, campaignId } = body;

    if (!subject || !emailTemplate) {
      return NextResponse.json({ error: 'Subject and email body are required.' }, { status: 400 });
    }

    // 2. Fetch Targeted Leads
    let targetLeads: { id: string; name: string | null; email: string; company: string | null }[] = [];

    if (Array.isArray(leadIds) && leadIds.length > 0) {
      targetLeads = await prisma.lead.findMany({
        where: { id: { in: leadIds } },
        select: { id: true, name: true, email: true, company: true },
      });
    } else if (audience === 'clients') {
      const clients = await prisma.user.findMany({
        where: { role: 'USER', email: { not: null } },
        select: { id: true, name: true, email: true },
      });
      targetLeads = clients
        .filter((c): c is typeof c & { email: string } => typeof c.email === 'string' && c.email.length > 0)
        .map(c => ({ id: c.id, name: c.name, email: c.email, company: null }));
    } else {
      // Default: All active Leads
      targetLeads = await prisma.lead.findMany({
        select: { id: true, name: true, email: true, company: true },
      });
    }

    if (targetLeads.length === 0) {
      return NextResponse.json({ success: true, message: 'No recipients found for audience.', total: 0 });
    }

    // 3. Create or Fetch Campaign Record
    let campaign = campaignId
      ? await prisma.campaign.findUnique({ where: { id: campaignId } })
      : null;

    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          name: `Broadcast: ${subject}`,
          subject,
          totalSent: targetLeads.length,
        },
      });
    }

    // 4. Construct Personalized Jobs for QStash Queue
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.agency';
    const baseUrl = rawAppUrl.replace(/\/$/, '');

    const emailJobs: EmailJobPayload[] = targetLeads.map((lead) => {
      const clientName = lead.name || 'there';
      const companyName = lead.company || 'your company';

      let personalizedBody = emailTemplate
        .replace(/\[Client Name\]/gi, clientName)
        .replace(/\{\{name\}\}/gi, clientName)
        .replace(/\[Company Name\]/gi, companyName)
        .replace(/\{\{company\}\}/gi, companyName);

      if (lead.id && campaign) {
        // Rewrite links for click tracking
        personalizedBody = personalizedBody.replace(/href="([^"]+)"/g, (match: string, p1: string) => {
          if (p1.includes('/api/webhooks/track') || p1.startsWith('mailto:') || p1.startsWith('tel:')) return match;
          const trackingUrl = `${baseUrl}/api/webhooks/track?leadId=${lead.id}&campaignId=${campaign!.id}&url=${encodeURIComponent(p1)}`;
          return `href="${trackingUrl}"`;
        });

        // Inject invisible open tracking pixel
        const pixelUrl = `${baseUrl}/api/webhooks/track?leadId=${lead.id}&campaignId=${campaign.id}`;
        personalizedBody += `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
      }

      return {
        to: lead.email,
        subject,
        html: personalizedBody,
        leadId: lead.id,
        campaignId: campaign!.id,
        clientName,
        companyName,
        type: 'campaign',
      };
    });

    // 5. Offload Entire Batch to QStash Queue (Non-blocking serverless execution)
    const queueResult = await enqueueBulkEmails(emailJobs, { delayStepSeconds: 1 });

    return NextResponse.json({
      success: true,
      message: `Successfully queued ${queueResult.queued} emails to QStash background workers.`,
      campaignId: campaign.id,
      totalRecipients: emailJobs.length,
      queued: queueResult.queued,
      failed: queueResult.failed,
    });
  } catch (error: unknown) {
    console.error('[/api/email/broadcast] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to queue broadcast campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
