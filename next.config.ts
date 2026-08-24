import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required to prevent Prisma from being bundled into edge/client chunks
  serverExternalPackages: ['@prisma/client', 'prisma', 'sharp'],

  images: {
    // Allow Next.js <Image> to optimize images from these external sources.
    // Add more domains here as new integrations are added.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // ─── IMPORTANT: Local filesystem writes ──────────────────────────────────
  // /api/upload and portfolio.actions.ts write to public/uploads/ on disk.
  // This works in local dev and on a persistent VPS, but Vercel's serverless
  // filesystem is ephemeral — files written at runtime are lost on next deploy.
  //
  // TODO (before full scale): Migrate upload routes to use Vercel Blob,
  // Cloudflare R2, or Supabase Storage so files persist across deployments.
  // ─────────────────────────────────────────────────────────────────────────
};

export default nextConfig;

