/**
 * Rate Limiting Utility for CoderNest Portal
 * Powered by Upstash Redis & @upstash/ratelimit (Sliding Window Algorithm)
 *
 * NOTE: Ensure the following environment variables are added to your .env file:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * If these are not yet configured in local development, an in-memory sliding window
 * fallback will seamlessly enforce identical rate limits without crashing.
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import type { NextRequest } from 'next/server';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  tier: 'tracking' | 'leads-email' | 'general' | 'none';
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isUpstashConfigured = Boolean(
  upstashUrl &&
  upstashToken &&
  !upstashUrl.includes('example') &&
  !upstashUrl.includes('placeholder')
);

// Initialize Upstash Redis client if credentials exist
const redis = isUpstashConfigured
  ? new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    })
  : null;

/**
 * TIER 1: Tracking (/api/track/*)
 * High-frequency heartbeat tracking: 10 requests per 10 seconds per IP
 */
export const trackingRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      prefix: 'codernest:ratelimit:tracking',
      analytics: false,
    })
  : null;

/**
 * TIER 2: Lead Capture & Emails (/api/leads/*, /api/email/*, /api/contact, /api/webhooks/lead*)
 * Strict protection against spam and resource abuse: 3 requests per 1 minute per IP
 */
export const leadsEmailRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '60 s'),
      prefix: 'codernest:ratelimit:leads-email',
      analytics: false,
    })
  : null;

// ─── IN-MEMORY SLIDING WINDOW FALLBACK (for Local Dev / Missing Env) ───────────
class InMemorySlidingWindow {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  public limit(key: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestInWindow = validTimestamps[0] || now;
      const reset = oldestInWindow + this.windowMs;
      this.requests.set(key, validTimestamps);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset,
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      reset: now + this.windowMs,
    };
  }
}

const memoryTrackingLimiter = new InMemorySlidingWindow(10, 10);
const memoryLeadsEmailLimiter = new InMemorySlidingWindow(3, 60);

/**
 * Extracts client IP address reliably from Vercel / Cloudflare / Proxy headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    if (ips[0]) return ips[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback for standard environments
  return (req as unknown as { ip?: string }).ip || '127.0.0.1';
}

/**
 * Determines whether a route requires rate-limiting and applies the corresponding tier
 */
export async function checkRateLimit(req: NextRequest): Promise<RateLimitResult> {
  const pathname = req.nextUrl.pathname;

  // Internal QStash and Workflow callbacks are authenticated by cryptographic signature
  if (pathname.startsWith('/api/qstash') || pathname.startsWith('/api/workflows')) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      tier: 'none',
    };
  }

  const ip = getClientIp(req);

  // 1. Tier 1: Tracking routes (/api/track/*)
  if (pathname.startsWith('/api/track')) {
    if (trackingRatelimit) {
      try {
        const res = await trackingRatelimit.limit(ip);
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
          tier: 'tracking',
        };
      } catch (err) {
        console.error('[RateLimit:Redis] Tracking check failed, falling back to memory:', err);
      }
    }

    const fallback = memoryTrackingLimiter.limit(ip);
    return {
      ...fallback,
      tier: 'tracking',
    };
  }

  // 2. Tier 2: Lead capture, email, contact, webhooks (/api/leads/*, /api/email/*, /api/contact)
  const isLeadsOrEmail =
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/email') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/webhooks/lead') ||
    pathname.startsWith('/api/webhooks/leads') ||
    pathname.startsWith('/api/webhooks/email') ||
    pathname.startsWith('/api/settings/test-email');

  if (isLeadsOrEmail) {
    if (leadsEmailRatelimit) {
      try {
        const res = await leadsEmailRatelimit.limit(ip);
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
          tier: 'leads-email',
        };
      } catch (err) {
        console.error('[RateLimit:Redis] Leads/Email check failed, falling back to memory:', err);
      }
    }

    const fallback = memoryLeadsEmailLimiter.limit(ip);
    return {
      ...fallback,
      tier: 'leads-email',
    };
  }

  // Not subject to strict rate-limiting tiers
  return {
    success: true,
    limit: 0,
    remaining: 0,
    reset: 0,
    tier: 'none',
  };
}
