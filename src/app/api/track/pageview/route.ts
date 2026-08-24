import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId, url, pageViewId, timeSpent } = body;

    // We can pull IP and simple location from Vercel headers if available
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown City';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown Country';
    const location = city !== 'Unknown City' ? `${city}, ${country}` : country;

    if (action === 'init') {
      if (!sessionId || !url) {
        return NextResponse.json({ error: 'Missing sessionId or url' }, { status: 400 });
      }

      // Upsert the visitor
      const visitor = await prisma.visitor.upsert({
        where: { sessionId },
        update: {
          ipAddress,
          location,
        },
        create: {
          sessionId,
          ipAddress,
          location,
        },
      });

      // Create a new PageView
      const pageView = await prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          url,
          timeSpent: 0,
        },
      });

      return NextResponse.json({ success: true, pageViewId: pageView.id });
    }

    if (action === 'update') {
      if (!pageViewId || timeSpent === undefined) {
        return NextResponse.json({ error: 'Missing pageViewId or timeSpent' }, { status: 400 });
      }

      // Update the time spent on the page view
      // Also updates the visitor's updatedAt timestamp implicitly if we wanted, 
      // but to be sure we can touch the visitor record to update "last active"
      
      const updatedPageView = await prisma.pageView.update({
        where: { id: pageViewId },
        data: { timeSpent: Math.floor(timeSpent) },
        include: { visitor: true }
      });

      // Touch the visitor to update their "updatedAt" for "last active time"
      await prisma.visitor.update({
        where: { id: updatedPageView.visitorId },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
