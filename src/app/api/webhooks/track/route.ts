import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRANSPARENT_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leadId = searchParams.get('leadId');
  const campaignId = searchParams.get('campaignId');
  const url = searchParams.get('url');

  if (!leadId || !campaignId) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  try {
    if (url) {
      // It's a click tracking hit
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalClicked: { increment: 1 } },
      });

      // Update lead status to engaged
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'engaged' },
      });

      // Find or create tracking log
      const existingLog = await prisma.emailTrackingLog.findFirst({
        where: { campaignId, leadId }
      });

      if (existingLog) {
        await prisma.emailTrackingLog.update({
          where: { id: existingLog.id },
          data: { status: 'CLICKED', clickedAt: new Date() }
        });
      } else {
        await prisma.emailTrackingLog.create({
          data: {
            campaignId,
            leadId,
            status: 'CLICKED',
            clickedAt: new Date()
          }
        });
      }

      return NextResponse.redirect(url);
    } else {
      // It's an open tracking pixel hit
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalOpened: { increment: 1 } },
      });

      // Update lead status
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'contacted' },
      });

      // Find or create tracking log
      const existingLog = await prisma.emailTrackingLog.findFirst({
        where: { campaignId, leadId }
      });

      if (existingLog) {
        // Only update if it wasn't already recorded as opened or clicked
        if (existingLog.status === 'SENT') {
          await prisma.emailTrackingLog.update({
            where: { id: existingLog.id },
            data: { status: 'OPENED', openedAt: new Date() }
          });
        }
      } else {
        await prisma.emailTrackingLog.create({
          data: {
            campaignId,
            leadId,
            status: 'OPENED',
            openedAt: new Date()
          }
        });
      }

      // Return a 1x1 transparent GIF
      return new NextResponse(TRANSPARENT_PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
  } catch (error) {
    console.error('Webhook tracking error:', error);
    // Even if tracking fails, return the pixel or redirect to avoid breaking the user experience
    if (url) {
      return NextResponse.redirect(url);
    }
    return new NextResponse(TRANSPARENT_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}
