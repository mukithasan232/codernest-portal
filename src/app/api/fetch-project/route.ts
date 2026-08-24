import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { url, projectId, isCaseStudy } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Ensure valid URL
    const validUrl = (!url.startsWith('http://') && !url.startsWith('https://')) ? `https://${url}` : url;

    // Fetch HTML
    const response = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoderNestBot/1.0; +http://codernest.agency)',
      },
      next: { revalidate: 0 } // no cache
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Failed to fetch URL. Status: ${response.status}` }, { status: 500 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Basic SEO Data
    const metaTitle = $('title').text() || $('meta[name="title"]').attr('content') || $('meta[property="og:title"]').attr('content') || null;
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;
    const ogImage = $('meta[property="og:image"]').attr('content') || null;

    // 2. Marketing Pixels
    let fbPixel: string | null = null;
    let googleAnalytics: string | null = null;
    let googleTagManager: string | null = null;

    // Regex for FB Pixel: fbq('init', '123456789')
    const fbMatch = html.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]\s*\)/);
    if (fbMatch && fbMatch[1]) fbPixel = fbMatch[1];

    // Regex for GA: G-XXXXXXXXXX or UA-XXXXXX-X
    const gaMatch = html.match(/(G-[A-Z0-9]+|UA-\d+-\d+)/);
    if (gaMatch && gaMatch[1]) googleAnalytics = gaMatch[1];

    // Regex for GTM: GTM-XXXXXXX
    const gtmMatch = html.match(/(GTM-[A-Z0-9]+)/);
    if (gtmMatch && gtmMatch[1]) googleTagManager = gtmMatch[1];

    const marketingPixels = {
      fbPixel,
      googleAnalytics,
      googleTagManager
    };

    // 3. Tech Stack Hints
    const techStack: string[] = [];
    if (html.includes('/wp-content/') || $('meta[name="generator"]').attr('content')?.includes('WordPress')) {
      techStack.push('WordPress');
    }
    if (html.includes('cdn.shopify.com') || html.includes('Shopify.shop')) {
      techStack.push('Shopify');
    }
    if (html.includes('id="__NEXT_DATA__"') || html.includes('/_next/')) {
      techStack.push('Next.js');
    }
    if (html.includes('data-reactroot') || html.includes('react-dom')) {
      techStack.push('React');
    }

    // 4. Auto-generate Challenge & Solution
    const challengeText = metaDesc || "The client needed a modern, scalable digital infrastructure to improve user experience and operational efficiency.";
    const solutionText = `Designed and developed a highly responsive, enterprise-grade architecture utilizing ${techStack.length > 0 ? techStack.join(', ') : 'modern web technologies'} to solve performance bottlenecks.`;

    const extractedData = {
      metaTitle,
      metaDesc,
      ogImage,
      marketingPixels,
      techStack,
      challengeText,
      solutionText
    };

    // 4. Update Database if ID provided
    if (projectId) {
      if (isCaseStudy) {
        // Need to fetch current techStack to merge without duplicates
        const currentCase = await prisma.caseStudy.findUnique({ where: { id: projectId }});
        const newStack = Array.from(new Set([...(currentCase?.techStack || []), ...techStack]));
        
        await prisma.caseStudy.update({
          where: { id: projectId },
          data: {
            techStack: newStack,
            marketingPixels,
            metaTitle: metaTitle || undefined,
            metaDesc: metaDesc || undefined,
            imageUrl: ogImage || undefined,
          }
        });
      } else {
        const currentProj = await prisma.project.findUnique({ where: { id: projectId }});
        const newStack = Array.from(new Set([...(currentProj?.techStack || []), ...techStack]));
        
        await prisma.project.update({
          where: { id: projectId },
          data: {
            techStack: newStack,
            marketingPixels,
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: unknown) {
    console.error('Fetch Project Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during fetch';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
