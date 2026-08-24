/**
 * targetCities.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Rich city database for CoderNest's pSEO engine.
 * Each entry contains unique, authentic data to ensure Google-safe, handcrafted
 * landing pages rather than templated doorway pages.
 *
 * ROLLOUT POLICY (safe & gradual):
 *   - Sitemap: first 3 cities only (controlled via sitemapCities slice below)
 *   - Phase 2 (next sprint): uncomment additional cities in sitemap.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ServiceFocus = 'web' | 'image' | 'both';

export interface TargetCity {
  /** URL slug, e.g. "new-york" → /agency/new-york */
  slug: string;
  name: string;
  country: 'USA' | 'UK';
  /** IANA timezone label for display (e.g. "EST", "GMT") */
  timezone: string;
  /** IANA timezone id for any runtime calculations */
  tzId: string;
  /** Primary industry vertical this city is known for */
  focusIndustry: string;
  /** Unique, city-specific value proposition — NOT a generic template */
  localUSP: string;
  /** Short punchy tagline for hero subheading */
  heroTagline: string;
  /** Which CoderNest service arm to lead with */
  primaryService: ServiceFocus;
  /** 3 specific pain points / challenges common to this city's market */
  localChallenges: [string, string, string];
  /** Trust signal — real or representative stat for this market */
  trustStat: { value: string; label: string };
}

export const targetCities: TargetCity[] = [
  // ── PHASE 1 SITEMAP CITIES (slug index 0–2) ──────────────────────────────
  {
    slug: 'new-york',
    name: 'New York',
    country: 'USA',
    timezone: 'EST',
    tzId: 'America/New_York',
    focusIndustry: 'FinTech & SaaS',
    localUSP:
      'Accelerating Wall Street startups and NYC SaaS founders with bulletproof Next.js 14 architectures, real-time data pipelines, and enterprise-grade security — built to survive NYSE-level traffic spikes.',
    heroTagline: 'The agency Wall Street SaaS founders trust.',
    primaryService: 'web',
    localChallenges: [
      'Legacy trading platforms unable to handle real-time concurrent load',
      'Compliance-first fintech products requiring SOC 2 ready architectures',
      'Investor-demo deadlines requiring high-velocity sprint delivery',
    ],
    trustStat: { value: '40ms', label: 'avg. API latency on fintech builds' },
  },
  {
    slug: 'london',
    name: 'London',
    country: 'UK',
    timezone: 'GMT',
    tzId: 'Europe/London',
    focusIndustry: 'E-commerce & Retail Tech',
    localUSP:
      'Delivering high-volume product image processing, Shopify headless architectures, and GDPR-compliant web infrastructure for UK retail brands scaling across EU markets.',
    heroTagline: 'Powering the UK\'s next generation of retail tech.',
    primaryService: 'both',
    localChallenges: [
      'Product catalogue images failing to convert due to inconsistent retouching',
      'Shopify storefronts hitting performance ceilings during flash sales',
      'Post-Brexit regulatory complexity requiring multi-region data compliance',
    ],
    trustStat: { value: '3×', label: 'conversion lift from premium product images' },
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    country: 'USA',
    timezone: 'PST',
    tzId: 'America/Los_Angeles',
    focusIndustry: 'AI Startups & Deep Tech',
    localUSP:
      'From Y Combinator MVPs to Series-B platform rebuilds — we ship production-ready AI-integrated Next.js applications with OpenAI, LangChain, and vector database backends that Bay Area investors actually fund.',
    heroTagline: 'From YC batch to Series B, we engineer it.',
    primaryService: 'web',
    localChallenges: [
      'AI wrappers needing scalable backend infrastructure before demo day',
      'Rapid pivot cycles requiring modular, composable codebase architecture',
      'Burn rate pressure demanding high-output engineering at startup speed',
    ],
    trustStat: { value: '72hr', label: 'from brief to deployed MVP' },
  },

  // ── PHASE 2 SITEMAP CITIES (add to sitemap.ts when ready) ────────────────
  {
    slug: 'austin',
    name: 'Austin',
    country: 'USA',
    timezone: 'CST',
    tzId: 'America/Chicago',
    focusIndustry: 'SaaS & Enterprise Software',
    localUSP:
      'Building scalable B2B SaaS platforms for Austin\'s booming tech corridor — from Dell Medical District health-tech startups to Oracle-partnered enterprise vendors — with world-class Node.js and Prisma backends.',
    heroTagline: 'Keep Austin innovative — ship better software, faster.',
    primaryService: 'web',
    localChallenges: [
      'B2B SaaS products scaling beyond initial traction without engineering debt',
      'Enterprise procurement demanding robust API documentation and security audits',
      'Multi-tenant data isolation for healthcare and compliance-heavy verticals',
    ],
    trustStat: { value: '99.98%', label: 'uptime across all managed SaaS apps' },
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    country: 'USA',
    timezone: 'CST',
    tzId: 'America/Chicago',
    focusIndustry: 'Manufacturing & Logistics Tech',
    localUSP:
      'Modernising Chicago\'s industrial backbone with real-time fleet dashboards, IoT-connected warehouse management systems, and high-performance logistics portals that reduce operational friction for Midwest enterprises.',
    heroTagline: 'Digitising Chicago\'s industrial heartland.',
    primaryService: 'web',
    localChallenges: [
      'Outdated ERP integrations causing supply chain visibility gaps',
      'Real-time fleet and warehouse dashboards requiring WebSocket infrastructure',
      'Legacy systems with no APIs requiring custom data extraction layers',
    ],
    trustStat: { value: '60%', label: 'average reduction in manual reporting time' },
  },
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    country: 'USA',
    timezone: 'PST',
    tzId: 'America/Los_Angeles',
    focusIndustry: 'Media, Fashion & Creative Tech',
    localUSP:
      'Serving LA\'s entertainment and fashion brands with premium image retouching pipelines, influencer-ready product photography enhancement, and performant e-commerce platforms that sell the lifestyle, not just the product.',
    heroTagline: 'Where creative vision meets engineering precision.',
    primaryService: 'image',
    localChallenges: [
      'Fashion brands needing consistent, on-brand product imagery at volume',
      'Talent agencies requiring high-throughput headshot retouching workflows',
      'D2C brands losing sales to slow-loading, unoptimised product galleries',
    ],
    trustStat: { value: '500+', label: 'images retouched per day at peak' },
  },
  {
    slug: 'manchester',
    name: 'Manchester',
    country: 'UK',
    timezone: 'GMT',
    tzId: 'Europe/London',
    focusIndustry: 'Digital Marketing & Agency Tech',
    localUSP:
      'Empowering Manchester\'s thriving digital agency ecosystem with white-label web development, CMS-powered client portals, and scalable infrastructure — so you can take on more clients without hiring more developers.',
    heroTagline: 'The dev partner Manchester agencies rely on.',
    primaryService: 'web',
    localChallenges: [
      'Digital agencies hitting capacity limits without trusted dev partners',
      'Clients demanding CMS flexibility beyond WordPress\'s limitations',
      'Tight UK agency margins requiring rapid delivery without sacrificing quality',
    ],
    trustStat: { value: '48hr', label: 'average turnaround on client landing pages' },
  },
  {
    slug: 'toronto',
    name: 'Toronto',
    country: 'USA', // Displayed as North America market
    timezone: 'EST',
    tzId: 'America/Toronto',
    focusIndustry: 'PropTech & Financial Services',
    localUSP:
      'Building sophisticated PropTech platforms and investment portals for Toronto\'s high-growth real estate market — featuring real-time listing aggregation, mortgage calculators, and compliant investor dashboards.',
    heroTagline: 'Engineering Toronto\'s property tech future.',
    primaryService: 'web',
    localChallenges: [
      'Real estate platforms struggling to aggregate MLS data at speed',
      'Investment portals requiring KYC compliance and secure document workflows',
      'Mobile-first property search apps with sub-2-second load requirements',
    ],
    trustStat: { value: '$2M+', label: 'in listings transacted through our platforms' },
  },
  {
    slug: 'miami',
    name: 'Miami',
    country: 'USA',
    timezone: 'EST',
    tzId: 'America/New_York',
    focusIndustry: 'Crypto, Web3 & Luxury Brands',
    localUSP:
      'Miami\'s intersection of crypto culture, luxury lifestyle, and Latin American commerce demands digital experiences that command premium prices. We build NFT platforms, crypto dashboards, and luxury brand websites that convert.',
    heroTagline: 'Premium digital for Miami\'s premium market.',
    primaryService: 'both',
    localChallenges: [
      'Web3 projects needing secure wallet-connect frontends and smart contract UIs',
      'Luxury brands requiring pixel-perfect product photography retouching',
      'Bilingual (EN/ES) market demanding multi-language, culturally adapted web copy',
    ],
    trustStat: { value: '4.9★', label: 'avg. client satisfaction across luxury projects' },
  },
  {
    slug: 'birmingham',
    name: 'Birmingham',
    country: 'UK',
    timezone: 'GMT',
    tzId: 'Europe/London',
    focusIndustry: 'SME Digital Transformation',
    localUSP:
      'Helping Birmingham\'s ambitious SMEs compete digitally with custom web applications, automated CRM workflows, and professional product photography retouching — elite agency quality at Midlands-market budget expectations.',
    heroTagline: 'Elite digital for the Midlands\' most ambitious SMEs.',
    primaryService: 'both',
    localChallenges: [
      'SMEs still running on spreadsheets needing affordable custom software',
      'Local product businesses losing online to national brands with better imagery',
      'Birmingham\'s growing tech scene requiring senior full-stack talent on-demand',
    ],
    trustStat: { value: '3 weeks', label: 'average project kickoff to live launch' },
  },
];

/**
 * Helper: look up a city by its URL slug.
 * Returns undefined for unknown slugs — callers should trigger notFound().
 */
export function getCityBySlug(slug: string): TargetCity | undefined {
  return targetCities.find((c) => c.slug === slug);
}

/**
 * The first N cities to include in the sitemap for the current rollout phase.
 * Change the slice argument to expand coverage gradually.
 */
export const SITEMAP_CITY_COUNT = 3;
export const sitemapCities = targetCities.slice(0, SITEMAP_CITY_COUNT);
