import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRANSPARENT_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const PIXEL_HEADERS = {
  'Content-Type': 'image/gif',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await context.params;
    if (!trackingId) {
      return new NextResponse(TRANSPARENT_PIXEL, { headers: PIXEL_HEADERS });
    }

    const log = await prisma.emailTrackingLog.findUnique({
      where: { trackingId },
    });

    if (log && log.status === 'SENT') {
      await prisma.emailTrackingLog.update({
        where: { id: log.id },
        data: { status: 'OPENED', openedAt: new Date() },
      });

      await prisma.campaign.update({
        where: { id: log.campaignId },
        data: { totalOpened: { increment: 1 } },
      });

      await prisma.lead.update({
        where: { id: log.leadId },
        data: { status: 'contacted' },
      }).catch(() => undefined);
    }
  } catch (error) {
    console.error('[email open pixel]', error);
  }

  return new NextResponse(TRANSPARENT_PIXEL, { headers: PIXEL_HEADERS });
}
