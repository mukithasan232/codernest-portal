import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, targetUrl, category, adCodeHtml } = body;

    if (!targetUrl && !adCodeHtml) {
      return NextResponse.json({ success: false, message: "Either Target URL or Ad Code HTML is required" }, { status: 400 });
    }

    let cleanAdCode = adCodeHtml;
    if (cleanAdCode) {
      // If user pasted a full HTML document, extract just the body contents
      const bodyMatch = cleanAdCode.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        cleanAdCode = bodyMatch[1].trim();
      }
    }

    const slug = crypto.randomBytes(3).toString('hex');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.cloud';
    const trackingUrl = targetUrl ? `${baseUrl}/api/r/${slug}` : null;

    let finalTargetUrl = targetUrl;
    if (targetUrl) {
      try {
        const urlObj = new URL(targetUrl);
        urlObj.searchParams.set('utm_source', 'codernest_portal');
        urlObj.searchParams.set('utm_medium', 'affiliate_banner');
        urlObj.searchParams.set('utm_campaign', slug);
        finalTargetUrl = urlObj.toString();
      } catch (e) {
        console.warn("Invalid target URL format for UTM injection", e);
      }
    }

    const newPromo = await prisma.brandPromotion.create({
      data: {
        title: title || "Untitled Brand Promotion",
        targetUrl: finalTargetUrl || null,
        trackingUrl: trackingUrl || null,
        slug,
        category: category || "Recommended",
        adCodeHtml: cleanAdCode || null,
        clicks: 0,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, data: newPromo });
  } catch (error: any) {
    console.error("Promo create error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const promotions = await prisma.brandPromotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: promotions });
  } catch (error: any) {
    console.error("Promo fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
