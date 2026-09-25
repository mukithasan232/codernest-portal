import { NextRequest, NextResponse } from 'next/server';
import { saveScrapedLead } from '@/actions/lead-collector.actions';
import { triggerOnboardingWorkflow } from '@/lib/workflow';
import { dispatchAdminAlert } from '@/lib/notifications.service';
import { sendTrackedLeadCaptureEmail } from '@/lib/lead-capture-email';

/**
 * POST /api/leads/capture
 *
 * Public-facing lead capture endpoint — no API key required.
 * Rate-limited by the fact that it routes through saveScrapedLead, which
 * deduplicates by email and applies the proxy-email guard automatically.
 *
 * Body: { name, email, source?, data? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, source, data, requirements: explicitRequirements } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Build a human-readable requirements string from the optional audit data, or use explicit
    let requirements = explicitRequirements || 'Captured via lead gate.';
    if (data && typeof data === 'object') {
      const lines = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
      if (lines) requirements = lines;
    }

    const result = await saveScrapedLead({
      name,
      email,
      source: source || 'Lead Gate',
      requirements,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.isProxyEmail && result.lead) {
      // Trigger durable onboarding workflow via Upstash Workflow
      triggerOnboardingWorkflow({
        leadId: result.lead.id,
        email: result.lead.email,
        name: result.lead.name,
        source: result.lead.source,
        serviceRequested: requirements,
      }).catch((err) => console.error('[Lead Capture] Failed to trigger onboarding workflow:', err));

      // Trigger Email with tracking pixel
      sendTrackedLeadCaptureEmail({
        leadId: result.lead.id,
        name: result.lead.name,
        email: result.lead.email,
        company: body.company,
        location: body.location,
        visitedPages: body.visitedPages,
      }).catch((err) => console.error('[Lead Capture] Failed to send tracked email:', err));

      // Broadcast real-time multi-channel alert to verified admin channels (SMS, WhatsApp, Telegram)
      dispatchAdminAlert({
        title: '🔥 New Inbound Lead Captured',
        message: `A new prospective client submitted inquiry via ${source || 'Lead Gate'}.`,
        data: {
          Name: name,
          Email: email,
          Source: source || 'Lead Gate',
          Details: requirements,
        },
      }).catch((err) => console.error('[Lead Capture] Failed to dispatch admin alert:', err));
    }

    return NextResponse.json({
      success: true,
      isProxyEmail: result.isProxyEmail ?? false,
      leadId: result.lead?.id,
    }, { status: 201 });

  } catch (err: any) {
    console.error('[/api/leads/capture]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
