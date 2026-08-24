/**
 * sitemap.ts — Next.js App Router sitemap
 * ─────────────────────────────────────────────────────────────────────────────
 * Controls what Google discovers and indexes.
 *
 * pSEO ROLLOUT POLICY:
 *   Phase 1 (now): First 3 cities only — New York, London, San Francisco.
 *   Phase 2: Increase SITEMAP_CITY_COUNT in targetCities.ts from 3 → 6.
 *   Phase 3: Increase to 10 once Phase 2 pages have been indexed & ranked.
 *
 *   This gradual approach prevents Google from flagging the new /agency/*
 *   pages as a doorway page cluster before they have proven engagement signals.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { MetadataRoute } from 'next';
import { sitemapCities } from '@/lib/data/targetCities';

const BASE_URL = 'https://codernest.agency';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Core marketing pages ──────────────────────────────────────────────────
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/image-studio`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ];

  // ── pSEO city pages (Phase 1: first 3 cities only) ───────────────────────
  // To expand: increase SITEMAP_CITY_COUNT in src/lib/data/targetCities.ts
  const cityRoutes: MetadataRoute.Sitemap = sitemapCities.map((city) => ({
    url: `${BASE_URL}/agency/${city.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...coreRoutes, ...cityRoutes];
}
