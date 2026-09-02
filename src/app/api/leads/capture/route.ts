import { NextRequest, NextResponse } from 'next/server';
import { saveScrapedLead } from '@/actions/lead-collector.actions';

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
