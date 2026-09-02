import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveVisitorIdentity } from '@/services/identity.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId, url, pageViewId, timeSpent } = body;

    // We can pull IP and simple location from Vercel headers if available
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown City';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown Country';
    const location = city !== 'Unknown City' ? `${city}, ${country}` : country;
    
    // ─── ENHANCED BOT DETECTION ──────────────────────────────────────────────────
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    
    // 1. User-Agent keyword blocklist — covers crawlers, headless browsers, HTTP libraries
    const BOT_UA_PATTERNS = [
      'bot', 'crawl', 'spider', 'slurp', 'mediapartners',
      'headless', 'phantomjs', 'puppeteer', 'playwright',
      'axios', 'postman', 'curl', 'wget', 'python-requests',
      'python-urllib', 'java/', 'httpclient', 'okhttp',
      'go-http-client', 'libwww', 'scrapy', 'ruby',
      'ahrefs', 'semrush', 'mj12bot', 'dotbot', 'exabot',
      'petalbot', 'yandexbot', 'baiduspider', 'duckduckbot',
      'facebot', 'ia_archiver', 'prerender', 'lighthouse',
    ];
    
    const uaIsBot = !userAgent || BOT_UA_PATTERNS.some(pattern => userAgent.includes(pattern));
    
    // 2. Browser presence check — real browsers ALWAYS send Accept-Language.
    //    HTTP clients and scrapers almost never do, or send something non-standard.
    const acceptLanguage = req.headers.get('accept-language') || '';
    const acceptHeader   = req.headers.get('accept') || '';
    
    // Real browsers send text/html or application/json; scanners often send */* only or nothing
    const hasRealAccept = acceptHeader.includes('text/html') || acceptHeader.includes('application/json');
    const hasLanguage   = acceptLanguage.length > 0;
    
    // A request is suspicious if it has NO accept-language AND no real accept header
    const headersLookLikeBot = !hasLanguage && !hasRealAccept;
    
    const isBot = uaIsBot || headersLookLikeBot;
    
    // ─── SILENT DROP — return 200 so we don't reveal the block ───────────────────
    if (isBot && action === 'init') {
      return NextResponse.json({ success: true, blocked: true });
    }

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
          isBot: false, // Only confirmed non-bots reach here
        },
        create: {
          sessionId,
          ipAddress,
          location,
          isBot: false,
        },
      });

      // Background task: If the visitor hasn't been identified yet, attempt reverse IP lookup
      if (!visitor.isIdentified && ipAddress !== 'Unknown') {
        // We don't await this so it doesn't block the request
        resolveVisitorIdentity(ipAddress).then(async (identity) => {
          if (identity.isIdentified) {
            await prisma.visitor.update({
              where: { id: visitor.id },
              data: {
                companyName: identity.companyName,
                isIdentified: true,
              }
            });
          }
        }).catch(err => console.error('Background identity resolution failed', err));
      }

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

      const updatedPageView = await prisma.pageView.update({
        where: { id: pageViewId },
        data: { timeSpent: Math.floor(timeSpent) },
        include: { visitor: { include: { pageViews: true } } }
      });

      // Touch the visitor to update their "updatedAt" for "last active time"
      await prisma.visitor.update({
        where: { id: updatedPageView.visitorId },
        data: { updatedAt: new Date() }
      });

      // ─── LEAD SCORE CALCULATION ────────────────────────────────────────────────
      const pageViews = updatedPageView.visitor.pageViews;
      let score = 0;
      let isHighIntent = false;
      
      // +10 for exploring > 3 pages (deep engagement)
      if (pageViews.length > 3) score += 10;
      
      pageViews.forEach(pv => {
        // +10 for landing on high-value conversion pages
        if (pv.url.includes('/contact') || pv.url.includes('/pricing')) {
          score += 10;
        }
        // +5 for each page where they spent > 60s (genuine reading)
        if (pv.timeSpent > 60) {
          score += 5;
        }
      });

      // High-intent: score ≥ 20 AND currently on a critical page
      const HIGH_INTENT_PAGES = ['/pricing', '/services', '/contact'];
      const isOnCriticalPage = HIGH_INTENT_PAGES.some(p => url?.includes(p));
      
      if (score >= 20 && isOnCriticalPage) {
        isHighIntent = true;
      }

      // Trigger chatbot/alert if score ≥ 20
      const triggerChatbot = score >= 20;

      return NextResponse.json({ success: true, triggerChatbot, score, isHighIntent });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
