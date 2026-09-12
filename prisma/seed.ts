import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Universal Dual-Mode Photo Editing & Software Pricing data...');

  // 1. Photo Services
  const services = [
    {
      title: 'Clipping Path',
      slug: 'clipping-path',
      description: 'High-quality precise clipping paths for product images with 100% hand-drawn pen tool vectors.',
      iconName: 'Scissors',
      imageUrl: '/dummy-laptop.png',
      features: [
        '100% Hand-Drawn Pen Tool Paths',
        'Multiple Path & Color Masking',
        'Drop Shadow & Reflection Creation',
        'Complex Jewelry & Apparel Handling',
      ],
      order: 1,
      isActive: true,
    },
    {
      title: 'Image Cutout',
      slug: 'image-cutout',
      description: 'Remove unwanted parts & 3D photo editing service with pixel-perfect edges.',
      iconName: 'Crop',
      imageUrl: '/dummy-laptop.png',
      features: [
        'Precise Edge Extraction',
        'Alpha Channel & Raster Masking',
        'Ghost Mannequin / Neck Joint',
        'Transparent PNG / White Background',
      ],
      order: 2,
      isActive: true,
    },
    {
      title: 'Retouching',
      slug: 'retouching',
      description: 'Enhance brightness, color, and overall image quality for high-converting ecommerce products.',
      iconName: 'Sparkles',
      imageUrl: '/dummy-laptop.png',
      features: [
        'High-End Jewelry & Beauty Retouching',
        'Frequency Separation & Texture Preservation',
        'Dust, Scratch & Glare Cleanup',
        'Color Cast & Exposure Correction',
      ],
      order: 3,
      isActive: true,
    },
    {
      title: 'Background Removal',
      slug: 'background-removal',
      description: 'Clearly remove or replace backgrounds with ease, complying with Amazon and marketplace rules.',
      iconName: 'Layers',
      imageUrl: '/dummy-laptop.png',
      features: [
        'Amazon, eBay & Shopify Compliance',
        'Natural Shadow Preservation',
        'Custom Background Replacement',
        'Bulk Batch Processing in 24 Hours',
      ],
      order: 4,
      isActive: true,
    },
  ];

  for (const s of services) {
    await prisma.photoService.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`Seeded ${services.length} PhotoServices.`);

  // 2. Clear old test plans and insert universal dual-mode plans
  await prisma.pricingPlan.deleteMany();

  const pricingPlans = [
    // ── PHOTO EDITING: UNIT-BASED ─────────────────────────────────────────
    {
      category: 'PHOTO_EDITING' as const,
      modelType: 'UNIT_BASED' as const,
      title: 'Clipping Path & Cutout',
      name: 'Clipping Path & Cutout',
      priceDisplay: '$0.20',
      unitLabel: '/per image',
      unit: '/per image',
      badge: 'High Volume',
      isPopular: false,
      minQuantity: 50,
      description: 'Precision pen-tool vector paths for e-commerce products and catalog cutouts.',
      features: [
        'Starting at Just $0.20 per simple image',
        '100% hand-drawn Photoshop vector clipping path',
        'Special tiered bulk pricing for 400+ images',
        '24-hour turnaround with free sample testing',
      ],
      ctaText: 'Calculate & Order',
      ctaAction: 'contact',
      ctaLink: '/contact',
      order: 1,
      isActive: true,
    },
    {
      category: 'PHOTO_EDITING' as const,
      modelType: 'UNIT_BASED' as const,
      title: 'High-End Product Retouching',
      name: 'High-End Product Retouching',
      priceDisplay: '$1.50',
      unitLabel: '/per image',
      unit: '/per image',
      badge: 'E-commerce Standard',
      isPopular: true,
      minQuantity: 10,
      description: 'Jewelry, apparel, and commercial product cleanup and color enhancement.',
      features: [
        'Frequency separation & skin/surface smoothing',
        'Dust, scratch, and reflection glare removal',
        'Drop shadows, reflections, and color grading',
        'Amazon & Shopify marketplace compliance',
      ],
      ctaText: 'Start Retouch Batch',
      ctaAction: 'contact',
      ctaLink: '/contact',
      order: 2,
      isActive: true,
    },

    // ── PHOTO EDITING: FIXED PACKAGE ──────────────────────────────────────
    {
      category: 'PHOTO_EDITING' as const,
      modelType: 'FIXED_PACKAGE' as const,
      title: 'Multi Layer Clipping',
      name: 'Multi Layer Clipping',
      priceDisplay: '$1-$3',
      unitLabel: '/per image',
      unit: '/per image',
      badge: 'Most Popular',
      isPopular: true,
      minQuantity: null,
      description: 'Isolate individual materials and garments for advanced recoloring.',
      features: [
        'Select & isolate every part of your image for precise color correction',
        'Independent layers for fabric, buttons, accessories, and background',
        'Full layered PSD/TIFF delivery with named channels',
        'Unlimited revisions until 100% satisfied',
      ],
      ctaText: 'info@clippingbd.com',
      ctaAction: 'contact',
      ctaLink: 'mailto:info@clippingbd.com',
      order: 1,
      isActive: true,
    },
    {
      category: 'PHOTO_EDITING' as const,
      modelType: 'FIXED_PACKAGE' as const,
      title: 'Monthly Fixed-Price Packages',
      name: 'Monthly Fixed-Price Packages',
      priceDisplay: '$1',
      unitLabel: '/per image',
      unit: '/per image',
      badge: 'Studio Retainer',
      isPopular: false,
      minQuantity: 200,
      description: 'Dedicated monthly editing capacity for continuous e-commerce brands.',
      features: [
        'Monthly fixed-price packages for regular clients & agencies',
        'Dedicated senior retouchers reserved for your brand style',
        'Direct communication via Slack or WhatsApp with 12h rush turns',
        'Dedicated account manager & invoice billing',
      ],
      ctaText: 'Whats App : +8801749616724',
      ctaAction: 'whatsapp',
      ctaLink: 'https://wa.me/8801749616724',
      order: 2,
      isActive: true,
    },

    // ── SOFTWARE DEV: UNIT-BASED (HOURLY / DAILY) ─────────────────────────
    {
      category: 'SOFTWARE_DEV' as const,
      modelType: 'UNIT_BASED' as const,
      title: 'Dedicated Senior Engineer',
      name: 'Dedicated Senior Engineer',
      priceDisplay: '$40',
      unitLabel: '/hour',
      unit: '/hour',
      badge: 'Flexible Staffing',
      isPopular: false,
      minQuantity: 10,
      description: 'Hire an elite senior full-stack developer on flexible pay-as-you-go hours.',
      features: [
        'Expert Next.js (App Router), TypeScript, Node.js & Prisma ORM',
        'Direct Slack & GitHub repo integration with your engineering team',
        'Transparent automated time tracking with verified commits',
        'Zero long-term lock-in, billed weekly',
      ],
      ctaText: 'Hire on Hourly',
      ctaAction: 'contact',
      ctaLink: '/contact',
      order: 1,
      isActive: true,
    },
    {
      category: 'SOFTWARE_DEV' as const,
      modelType: 'UNIT_BASED' as const,
      title: 'Full-Day Engineering Sprint',
      name: 'Full-Day Engineering Sprint',
      priceDisplay: '$300',
      unitLabel: '/day',
      unit: '/day',
      badge: 'High Impact',
      isPopular: true,
      minQuantity: 3,
      description: 'Intense, uninterrupted 8-hour sprint dedicated to complex features or hotfixes.',
      features: [
        'Dedicated senior engineer focusing exclusively on your backlog',
        'Complex API integrations (Stripe, Upstash, OpenAI, Supabase)',
        'Database query optimization, schema migrations & bug triage',
        'End-of-day production pull request with walkthrough video',
      ],
      ctaText: 'Book Dev Sprint',
      ctaAction: 'contact',
      ctaLink: '/contact',
      order: 2,
      isActive: true,
    },

    // ── SOFTWARE DEV: FIXED PACKAGE (MONTHLY / MILESTONES) ────────────────
    {
      category: 'SOFTWARE_DEV' as const,
      modelType: 'FIXED_PACKAGE' as const,
      title: 'MVP Launch Accelerator',
      name: 'MVP Launch Accelerator',
      priceDisplay: '$4,500',
      unitLabel: '/project',
      unit: '/project',
      badge: 'Startup Favorite',
      isPopular: false,
      minQuantity: null,
      description: 'Turn your product concept into a launch-ready production SaaS in 2-3 weeks.',
      features: [
        'Full-stack Next.js App Router, Tailwind CSS & Prisma ORM backend',
        'Role-based authentication, user dashboards & settings',
        'Stripe / Paddle billing & subscription webhook integration',
        'Enterprise rate-limiting, SEO metadata & Vercel deployment',
        '30 days post-launch warranty & bug fixes',
      ],
      ctaText: 'Launch Your MVP',
      ctaAction: 'checkout',
      ctaLink: '/contact',
      order: 1,
      isActive: true,
    },
    {
      category: 'SOFTWARE_DEV' as const,
      modelType: 'FIXED_PACKAGE' as const,
      title: 'Enterprise Tech Partner Retainer',
      name: 'Enterprise Tech Partner Retainer',
      priceDisplay: '$6,000',
      unitLabel: '/month',
      unit: '/month',
      badge: 'Most Popular',
      isPopular: true,
      minQuantity: null,
      description: 'A complete fractional engineering squad to scale your web application continuously.',
      features: [
        'Fractional Lead Architect + Dedicated Senior Full-Stack Engineers',
        'Continuous feature shipping, performance audits & security patches',
        'Real-time Slack channel, daily async standups & weekly demos',
        'Guaranteed 1-hour critical response SLA',
        'DevOps CI/CD, database backups & cloud monitoring',
      ],
      ctaText: 'Secure Retainer',
      ctaAction: 'contact',
      ctaLink: '/contact',
      order: 2,
      isActive: true,
    },
  ];

  for (const p of pricingPlans) {
    await prisma.pricingPlan.create({ data: p });
  }
  console.log(`Seeded ${pricingPlans.length} Universal Dual-Mode PricingPlans.`);

  // 3. Before/After Showcase
  const existingShowcases = await prisma.beforeAfterShowcase.findMany();
  if (existingShowcases.length === 0) {
    const showcases = [
      {
        title: 'Jewelry Clipping & Retouching',
        category: 'Clipping Path',
        beforeImage: '/uploads/media/1788382703903-412306699-Screenshot2026-09-03at2.58.20AM.png',
        afterImage: '/uploads/media/1788382734277-944822245-Screenshot2026-09-03at2.58.50AM.png',
        order: 1,
        isActive: true,
      },
      {
        title: 'Apparel Ghost Mannequin & Neck Joint',
        category: 'Ghost Mannequin',
        beforeImage: '/uploads/media/1788382656271-910943777-Screenshot2026-09-03at2.57.32AM.png',
        afterImage: '/uploads/media/1788382787841-202593526-Screenshot2026-09-03at2.59.43AM.png',
        order: 2,
        isActive: true,
      },
      {
        title: 'Product Shadow & Color Correction',
        category: 'Color Correction',
        beforeImage: '/uploads/media/1788382441956-422497682-Screenshot2026-09-03at2.53.54AM.png',
        afterImage: '/uploads/media/1788382493882-771316256-Screenshot2026-09-03at2.54.49AM.png',
        order: 3,
        isActive: true,
      },
    ];

    for (const sc of showcases) {
      await prisma.beforeAfterShowcase.create({ data: sc });
    }
    console.log(`Seeded ${showcases.length} BeforeAfterShowcases.`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
