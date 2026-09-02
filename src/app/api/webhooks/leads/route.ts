import { NextRequest, NextResponse } from 'next/server';
import { saveScrapedLead } from '@/actions/lead-collector.actions';

// Ensure this route is dynamic so it can accept POST requests without being statically cached
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 0. Security Check: Validate Webhook Secret
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'codernest_default_secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing Bearer token.' },
        { status: 401 }
      );
    }

    // 1. Check if the request has a valid JSON body
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    // 2. Pass payload directly to our trusted lead collection action
    const response = await saveScrapedLead(body);

    if (response.success) {
      return NextResponse.json(
        {
          success: true,
          message: response.message || 'Lead successfully harvested.',
          isProxyEmail: response.isProxyEmail ?? false,
          leadId: response.lead?.id,
        },
        { status: 201 }
      );
    } else {
      // Return a 400 Bad Request if validation failed, otherwise a 500
      const isValidationError = response.error?.includes('Invalid email format');
      return NextResponse.json(
        { success: false, error: response.error },
        { status: isValidationError ? 400 : 500 }
      );
    }
  } catch (error: any) {
    console.error('[WEBHOOK LEADS ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload or internal server error.' },
      { status: 500 }
    );
  }
}

// Optionally handle GET requests to test if the endpoint is alive
export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'CoderNest Lead Harvester Webhook API is active. Send POST requests to this endpoint.',
  });
}
