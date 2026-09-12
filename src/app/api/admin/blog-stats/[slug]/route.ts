import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Basic auth check for admin routes
    if (!session || !['SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch the blog post views directly
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { views: true }
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Prepare timeframes for trend calculation
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const urlPattern = `/blog/${slug}`;

    // Recent 7 days views
    const last7DaysCount = await prisma.pageView.count({
      where: {
        url: { contains: urlPattern },
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Previous 7 days views
    const prev7DaysCount = await prisma.pageView.count({
      where: {
        url: { contains: urlPattern },
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });

    // Calculate trend percentage
    let trend = 0;
    if (prev7DaysCount === 0) {
      trend = last7DaysCount > 0 ? 100 : 0;
    } else {
      trend = Math.round(((last7DaysCount - prev7DaysCount) / prev7DaysCount) * 100);
    }

    // Average time spent and top locations (fetching all recent pageviews to aggregate)
    const recentPageViews = await prisma.pageView.findMany({
      where: { url: { contains: urlPattern } },
      include: { visitor: true },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    });

    let totalTimeSpent = 0;
    let timeSpentCount = 0;
    const locationCounts: Record<string, number> = {};

    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const getCountryName = (loc: string | null | undefined) => {
      if (!loc || loc === 'Unknown' || loc === 'Unknown Country' || loc === 'Unknown Region') return 'Unknown Region';
      if (loc.length === 2) {
        try {
          return regionNames.of(loc.toUpperCase()) || loc;
        } catch {
          return loc;
        }
      }
      return loc;
    };

    recentPageViews.forEach(pv => {
      if (pv.timeSpent > 0) {
        totalTimeSpent += pv.timeSpent;
        timeSpentCount++;
      }
      
      const loc = getCountryName(pv.visitor?.location);
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const averageTimeSpent = timeSpentCount > 0 ? Math.round(totalTimeSpent / timeSpentCount) : 0;
    
    // Sort locations to get top 3
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Recent 5 visitors
    const recentVisitors = recentPageViews.slice(0, 5).map(pv => ({
      id: pv.id,
      timestamp: pv.createdAt.toISOString(),
      isBot: pv.visitor?.isBot || false,
      location: getCountryName(pv.visitor?.location)
    }));

    return NextResponse.json({
      views: blog.views,
      trend,
      averageTimeSpent,
      topLocations,
      recentVisitors
    });
  } catch (error) {
    console.error('Blog stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
