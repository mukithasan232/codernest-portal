import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required to prevent Prisma from being bundled into edge/client chunks
  serverExternalPackages: ['@prisma/client', 'prisma', 'sharp'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },


  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Allow Next.js <Image> to optimize images from these external sources.
    // Add more domains here as new integrations are added.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },

  // ─── Global HTTP Security Headers ─────────────────────────────────────────
  async headers() {
    // Blocks Adsterra/popunder-style ad networks that were injecting casino/dating ads.
    // 'unsafe-inline' is required for Next.js App Router hydration; tighten with nonces later.
    const contentSecurityPolicy = [
      "default-src 'self'",
      [
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://pagead2.googlesyndication.com",
        "https://fundingchoicesmessages.google.com",
        "https://ep2.adtrafficquality.google",
        "https://www.google.com",
        "https://connect.facebook.net",
        "https://va.vercel-scripts.com",
        "https://vitals.vercel-insights.com",
        "https://js.stripe.com",
      ].join(' '),
      [
        "style-src 'self' 'unsafe-inline'",
        "https://fonts.googleapis.com",
      ].join(' '),
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      [
        "connect-src 'self'",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://pagead2.googlesyndication.com",
        "https://ep1.adtrafficquality.google",
        "https://fundingchoicesmessages.google.com",
        "https://www.google.com",
        "https://connect.facebook.net",
        "https://www.facebook.com",
        "https://va.vercel-scripts.com",
        "https://vitals.vercel-insights.com",
        "https://api.stripe.com",
      ].join(' '),
      [
        "frame-src 'self'",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com",
        "https://www.google.com",
        "https://www.facebook.com",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
      ].join(' '),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;

