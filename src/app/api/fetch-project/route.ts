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

    // 3. Tech Stack Hints — fingerprint-based detection
    const techStack: string[] = [];

    // Helper: case-insensitive multi-pattern check
    const detect = (patterns: string[]): boolean =>
      patterns.some((p) => html.toLowerCase().includes(p.toLowerCase()));

    // --- CMS / Site Builders ---
    if (detect(['/wp-content/', 'wp-includes', 'wp-json']) || $('meta[name="generator"]').attr('content')?.toLowerCase().includes('wordpress')) {
      techStack.push('WordPress');
    }
    if (detect(['cdn.shopify.com', 'Shopify.shop', 'shopify-section', 'shopify.com/s/files'])) {
      techStack.push('Shopify');
    }
    if (detect(['squarespace.com', 'static.squarespace.com'])) {
      techStack.push('Squarespace');
    }
    if (detect(['wix.com', 'wixstatic.com', 'wix-code'])) {
      techStack.push('Wix');
    }
    if (detect(['webflow.io', 'webflow.com', 'data-wf-domain'])) {
      techStack.push('Webflow');
    }
    if (detect(['ghost.io', 'ghost/api', 'ghost-url'])) {
      techStack.push('Ghost');
    }
    if ($('meta[name="generator"]').attr('content')?.toLowerCase().includes('joomla')) {
      techStack.push('Joomla');
    }
    if ($('meta[name="generator"]').attr('content')?.toLowerCase().includes('drupal') || detect(['/sites/default/files', 'drupal.js'])) {
      techStack.push('Drupal');
    }

    // --- JS Frameworks ---
    if (detect(['id="__next"', 'id="__NEXT_DATA__"', '/_next/', '__NEXT_DATA__'])) {
      techStack.push('Next.js');
    }
    if (detect(['data-reactroot', 'react-dom', '__reactFiber', 'react.production.min.js'])) {
      techStack.push('React');
    }
    if (detect(['__nuxt', '_nuxt/', 'nuxt.js', '__NUXT__'])) {
      techStack.push('Nuxt.js');
    }
    if (detect(['ng-version', 'ng-app', 'angular.js', 'angular.min.js', '__ng_app'])) {
      techStack.push('Angular');
    }
    if (detect(['__vue__', 'vue.runtime', 'vue.min.js', 'vue.js', 'data-v-app'])) {
      techStack.push('Vue.js');
    }
    if (detect(['svelte', 'svelte-kit', 'svelte.js'])) {
      techStack.push('Svelte');
    }
    if (detect(['astro-island', 'astro-root', 'astro.build'])) {
      techStack.push('Astro');
    }
    if (detect(['remix.run', '__remixContext', '__remix'])) {
      techStack.push('Remix');
    }
    if (detect(['gatsby', '__gatsby', 'gatsby-focus-wrapper', '/page-data/'])) {
      techStack.push('Gatsby');
    }
    if (detect(['vite.js', '/@vite/', 'vite/modulepreload-polyfill'])) {
      techStack.push('Vite');
    }

    // --- Languages / Runtimes ---
    if (detect(['typescript', '.ts"', '.ts\'', 'tsconfig'])) {
      techStack.push('TypeScript');
    }
    if (detect(['node_modules', 'node.js', 'nodejs', 'express.js', 'express/'])) {
      techStack.push('Node.js');
    }
    if (detect(['python', 'django', 'flask', 'fastapi', 'uvicorn'])) {
      techStack.push('Python');
    }
    if (detect(['laravel', 'artisan', 'blade.php'])) {
      techStack.push('Laravel');
    }
    if (detect(['rails', 'rubyonrails', 'ruby-on-rails'])) {
      techStack.push('Ruby on Rails');
    }

    // --- CSS Frameworks / UI Libraries ---
    if (detect(['tailwindcss', 'tailwind.css', 'tailwind.min.css', 'cdn.tailwindcss'])) {
      techStack.push('Tailwind CSS');
    }
    if (detect(['bootstrap.min.css', 'bootstrap.css', 'bootstrap.bundle', 'cdn.jsdelivr.net/npm/bootstrap'])) {
      techStack.push('Bootstrap');
    }
    if (detect(['material-ui', '@mui/', 'muix', 'material.min.js'])) {
      techStack.push('Material UI');
    }
    if (detect(['chakra-ui', '@chakra-ui'])) {
      techStack.push('Chakra UI');
    }
    if (detect(['shadcn', 'shadcn-ui', 'ui.shadcn.com'])) {
      techStack.push('shadcn/ui');
    }
    if (detect(['framer-motion', 'framer.com'])) {
      techStack.push('Framer Motion');
    }

    // --- Databases / ORMs ---
    if (detect(['prisma', '@prisma/client', 'prisma.io'])) {
      techStack.push('Prisma');
    }
    if (detect(['mongodb', 'mongoose', 'atlas.mongodb.com'])) {
      techStack.push('MongoDB');
    }
    if (detect(['postgresql', 'postgres', 'pg.', 'neon.tech', 'supabase'])) {
      techStack.push('PostgreSQL');
    }
    if (detect(['supabase', 'supabase.co', 'supabase.js'])) {
      techStack.push('Supabase');
    }
    if (detect(['firebase', 'firebaseapp.com', 'firebasejs'])) {
      techStack.push('Firebase');
    }
    if (detect(['redis', 'ioredis', 'upstash'])) {
      techStack.push('Redis');
    }
    if (detect(['graphql', 'apollo-client', 'apollo/client'])) {
      techStack.push('GraphQL');
    }

    // --- Infra / DevOps ---
    if (detect(['docker', 'dockerfile', 'docker-compose'])) {
      techStack.push('Docker');
    }
    if (detect(['kubernetes', 'k8s', 'helm.sh'])) {
      techStack.push('Kubernetes');
    }
    if (detect(['github-actions', '.github/workflows', 'ci/cd', 'circleci', 'travis-ci', 'gitlab-ci'])) {
      techStack.push('CI/CD');
    }
    if (detect(['vercel', '_vercel', 'vercel.app'])) {
      techStack.push('Vercel');
    }
    if (detect(['netlify', 'netlify.app', 'netlify-cms'])) {
      techStack.push('Netlify');
    }
    if (detect(['cloudflare', 'cloudflare.com', '__cf_bm'])) {
      techStack.push('Cloudflare');
    }
    if (detect(['stripe.com/v3', 'stripe.js', 'js.stripe.com'])) {
      techStack.push('Stripe');
    }

    // --- State Management / Data Fetching ---
    if (detect(['redux', 'reduxjs/toolkit', 'react-redux'])) {
      techStack.push('Redux');
    }
    if (detect(['swr', 'vercel/swr'])) {
      techStack.push('SWR');
    }
    if (detect(['tanstack', 'react-query', '@tanstack/react-query'])) {
      techStack.push('React Query');
    }
    if (detect(['trpc', '@trpc/client', '@trpc/server'])) {
      techStack.push('tRPC');
    }

    // --- Auth ---
    if (detect(['next-auth', 'nextauth', 'authjs'])) {
      techStack.push('NextAuth.js');
    }
    if (detect(['auth0.com', 'auth0.js'])) {
      techStack.push('Auth0');
    }
    if (detect(['clerk.dev', 'clerk.com', 'clerk.js'])) {
      techStack.push('Clerk');
    }

    // Deduplicate in case of overlapping patterns
    const uniqueStack = Array.from(new Set(techStack));

    // 4. Auto-generate Challenge & Solution
    const challengeText = metaDesc || "The client needed a modern, scalable digital infrastructure to improve user experience and operational efficiency.";
    const solutionText = `Designed and developed a highly responsive, enterprise-grade architecture utilizing ${uniqueStack.length > 0 ? uniqueStack.join(', ') : 'modern web technologies'} to solve performance bottlenecks.`;

    const extractedData = {
      metaTitle,
      metaDesc,
      ogImage,
      marketingPixels,
      techStack: uniqueStack,
      challengeText,
      solutionText
    };

    // 4. Update Database if ID provided
    if (projectId) {
      if (isCaseStudy) {
        // Need to fetch current techStack to merge without duplicates
        const currentCase = await prisma.caseStudy.findUnique({ where: { id: projectId }});
        const newStack = Array.from(new Set([...(currentCase?.techStack || []), ...uniqueStack]));
        
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
        const newStack = Array.from(new Set([...(currentProj?.techStack || []), ...uniqueStack]));
        
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
