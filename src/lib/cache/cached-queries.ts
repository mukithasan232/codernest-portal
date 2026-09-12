import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { PhotoService, PricingPlan, BeforeAfterShowcase } from '@/types';

/**
 * 1. Global System Settings (Branding, Scripts, Colors)
 * Cached on Vercel CDN for 1 hour, invalidated on admin settings update.
 */
export const getCachedSystemSettings = unstable_cache(
  async () => {
    try {
      return await prisma.systemSettings.findUnique({
        where: { id: 'global_settings' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load system settings:', e);
      return null;
    }
  },
  ['global-system-settings'],
  { revalidate: 86400, tags: ['settings'] }
);

/**
 * 2. Published Testimonials
 */
export const getCachedTestimonials = unstable_cache(
  async () => {
    try {
      return await prisma.testimonial.findMany({
        where: { is_published: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load testimonials:', e);
      return [];
    }
  },
  ['public-testimonials'],
  { revalidate: 86400, tags: ['testimonials'] }
);

/**
 * 3. Featured & Published Case Studies
 */
export const getCachedCaseStudies = unstable_cache(
  async () => {
    try {
      let featured = await prisma.caseStudy.findMany({
        where: { featured: true },
        take: 6,
        orderBy: { updatedAt: 'desc' },
      });

      if (featured.length < 3) {
        const remainingCount = 3 - featured.length;
        const featuredIds = featured.map(c => c.id);
        const fallback = await prisma.caseStudy.findMany({
          where: { id: { notIn: featuredIds } },
          take: remainingCount,
          orderBy: { createdAt: 'desc' },
        });
        featured = [...featured, ...fallback];
      }

      return featured as unknown as import('@/types').CaseStudy[];
    } catch (e) {
      console.error('[Cache] Failed to load case studies:', e);
      return [] as import('@/types').CaseStudy[];
    }
  },
  ['public-case-studies'],
  { revalidate: 86400, tags: ['case-studies'] }
);

/**
 * 4. Latest Published Blog Posts
 */
export const getCachedLatestBlogs = unstable_cache(
  async (limit: number = 3) => {
    try {
      return await prisma.blog.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (e) {
      console.error('[Cache] Failed to load blogs:', e);
      return [];
    }
  },
  ['public-latest-blogs'],
  { revalidate: 86400, tags: ['blogs'] }
);

/**
 * 5. Universal Pricing Plans
 */
export const getCachedPricingPlans = unstable_cache(
  async () => {
    try {
      return await prisma.pricingPlan.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load pricing plans:', e);
      return [];
    }
  },
  ['public-pricing-plans'],
  { revalidate: 86400, tags: ['pricing-plans'] }
);

/**
 * 6. Photo Editing Services
 */
export const getCachedPhotoServices = unstable_cache(
  async () => {
    try {
      return await prisma.photoService.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load photo services:', e);
      return [];
    }
  },
  ['public-photo-services'],
  { revalidate: 86400, tags: ['photo-services'] }
);

/**
 * 7. Before / After Showcases
 */
export const getCachedBeforeAfterShowcases = unstable_cache(
  async () => {
    try {
      return await prisma.beforeAfterShowcase.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load showcases:', e);
      return [];
    }
  },
  ['public-before-after-showcases'],
  { revalidate: 86400, tags: ['before-after-showcases'] }
);

/**
 * 8. Active Team Members
 */
export const getCachedTeamMembers = unstable_cache(
  async () => {
    try {
      return await prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load team members:', e);
      return [];
    }
  },
  ['public-team-members'],
  { revalidate: 86400, tags: ['team-members'] }
);

/**
 * 9. Processed Portfolio Images
 */
export const getCachedPortfolioImages = unstable_cache(
  async () => {
    try {
      return await prisma.portfolioImage.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load portfolio images:', e);
      return [];
    }
  },
  ['public-portfolio-images'],
  { revalidate: 86400, tags: ['portfolio-images'] }
);

/**
 * 10. All Published Blogs
 */
export const getCachedAllBlogs = unstable_cache(
  async () => {
    try {
      return await prisma.blog.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('[Cache] Failed to load all blogs:', e);
      return [];
    }
  },
  ['public-all-blogs'],
  { revalidate: 86400, tags: ['blogs'] }
);

/**
 * 11. Single Published Blog by Slug
 */
export const getCachedBlogBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        return await prisma.blog.findFirst({
          where: { slug, status: 'published' },
        });
      } catch (e) {
        console.error(`[Cache] Failed to load blog by slug ${slug}:`, e);
        return null;
      }
    },
    [`blog-detail-${slug}`],
    { revalidate: 86400, tags: ['blogs', `blog-${slug}`] }
  )();

