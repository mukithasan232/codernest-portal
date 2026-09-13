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

    // ─── 1. INITIALIZE PAGEVIEW (FAST UPSERT & DIRECT WRITE) ─────────────────────
    if (action === 'init') {
      if (!sessionId || !url) {
        return NextResponse.json({ error: 'Missing sessionId or url' }, { status: 400 });
      }

      // Upsert visitor selecting only essential fields (avoids heavy serialization)
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
        select: {
          id: true,
          isIdentified: true,
        },
      });

      // Background task: If the visitor hasn't been identified yet, attempt reverse IP lookup
      if (!visitor.isIdentified && ipAddress !== 'Unknown') {
        resolveVisitorIdentity(ipAddress).then(async (identity) => {
          if (identity.isIdentified) {
            // Prisma Json type needs to be handled properly. Just passing it works for MongoDB.
            await prisma.visitor.update({
              where: { id: visitor.id },
              data: {
                companyName: identity.companyName,
                domain: identity.domain,
                companyData: identity.companyData ? (identity.companyData as any) : undefined,
                isIdentified: true,
              },
              select: { id: true },
            });
          }
        }).catch(err => console.error('[Tracking API] Background identity resolution failed:', err));
      }

      // Create a new PageView with lean select
      const pageView = await prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          url,
          timeSpent: 0,
        },
        select: { id: true },
      });

      return NextResponse.json({ success: true, pageViewId: pageView.id });
    }

    // ─── 2. HEARTBEAT UPDATE (ZERO BLOCKING, SINGLE NESTED WRITE) ────────────────
    if (action === 'update') {
      if (!pageViewId || timeSpent === undefined) {
        return NextResponse.json({ error: 'Missing pageViewId or timeSpent' }, { status: 400 });
      }

      const safeTimeSpent = Math.max(0, Math.floor(Number(timeSpent) || 0));

      // Calculate high-intent trigger instantly from request metadata without DB reads
      const isCriticalPage = Boolean(url && ['/pricing', '/services', '/contact'].some((p: string) => url.includes(p)));
      const triggerChatbot = safeTimeSpent >= 30 && isCriticalPage;

      // Asynchronous background write: Single Prisma nested update for PageView + Visitor
      // Return 200 OK immediately so the visitor's browser is NEVER held up by DB latency
      (async () => {
        try {
          await prisma.pageView.update({
            where: { id: pageViewId },
            data: {
              timeSpent: safeTimeSpent,
              visitor: {
                update: {
                  updatedAt: new Date(),
                },
              },
            },
            select: { id: true },
          });
        } catch (err) {
          // Gracefully catch cases where record does not exist or transient connection dropped
          console.error('[Tracking API] Background heartbeat update error:', err);
        }
      })();

      return NextResponse.json({ success: true, triggerChatbot });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
