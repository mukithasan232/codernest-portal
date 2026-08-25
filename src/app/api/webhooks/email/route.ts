import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET Handler (For Custom 1x1 Tracking Pixel)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const campaignId = searchParams.get('campaignId');
    const leadId = searchParams.get('leadId');

    if (action === 'open' && campaignId && leadId) {
      // Find the existing log
      const log = await prisma.emailTrackingLog.findFirst({
        where: { campaignId, leadId }
      });

      if (log && log.status !== 'OPENED' && log.status !== 'CLICKED') {
        // Update log status to OPENED
        await prisma.emailTrackingLog.update({
          where: { id: log.id },
          data: { status: 'OPENED', openedAt: new Date() }
        });

        // Increment campaign open count
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { totalOpened: { increment: 1 } }
        });
      }
    }

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Tracking Pixel Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// 2. POST Handler (For ESP Webhooks like Resend)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Example logic for generic webhooks (e.g. Resend)
    const type = body.type; // 'email.opened', 'email.clicked', 'email.bounced'
    const tags = body.data?.tags; // Assuming we passed campaignId and leadId in ESP tags

    if (!tags || !tags.campaignId || !tags.leadId) {
      return NextResponse.json({ success: true, message: 'Ignored: No tracking tags found.' });
    }

    const { campaignId, leadId } = tags;

    const log = await prisma.emailTrackingLog.findFirst({
      where: { campaignId, leadId }
    });

    if (!log) {
      return NextResponse.json({ success: false, error: 'Log not found' }, { status: 404 });
    }

    if (type === 'email.opened' && log.status !== 'OPENED' && log.status !== 'CLICKED') {
      await prisma.emailTrackingLog.update({
        where: { id: log.id },
        data: { status: 'OPENED', openedAt: new Date() }
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalOpened: { increment: 1 } }
      });
    } else if (type === 'email.clicked' && log.status !== 'CLICKED') {
      await prisma.emailTrackingLog.update({
        where: { id: log.id },
        data: { status: 'CLICKED', clickedAt: new Date() }
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalClicked: { increment: 1 } }
      });
    } else if (type === 'email.bounced') {
      await prisma.emailTrackingLog.update({
        where: { id: log.id },
        data: { status: 'BOUNCED' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
