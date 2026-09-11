import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkRateLimit } from "@/lib/ratelimit"

// Global HTTP Security Headers
const SECURITY_HEADERS: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
};

function applySecurityHeaders(res: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ─── 1. EDGE RATE LIMITING FOR APIS (/api/*) ──────────────────────────────────
  if (path.startsWith('/api')) {
    const rateLimit = await checkRateLimit(req);

    if (!rateLimit.success) {
      const retryAfter = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          tier: rateLimit.tier,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
            ...SECURITY_HEADERS,
          },
        }
      );
    }

    const res = NextResponse.next();
    if (rateLimit.limit > 0) {
      res.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
      res.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
      res.headers.set('X-RateLimit-Reset', String(rateLimit.reset));
    }
    return applySecurityHeaders(res);
  }

  // ─── 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ─────────────────────────────
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userRole = token?.role ? (token.role as string).toUpperCase() : "CLIENT";

  // Ignore Auth Routes for unauthenticated users, but redirect authenticated ones
  if (path.startsWith('/auth')) {
    if (token) {
      if (userRole === 'SUPER_ADMIN' || userRole === 'EDITOR') {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', req.url)));
      } else {
        return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', req.url)));
      }
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // If not authenticated and trying to access protected routes
  if (!token && (path.startsWith('/admin') || path.startsWith('/dashboard'))) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/auth/login', req.url)));
  }

  // Client users trying to access admin routes
  if (path.startsWith('/admin')) {
    if (userRole === 'CLIENT') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', req.url)));
    }
  }

  // Admin users trying to access client dashboard
  if (path.startsWith('/dashboard')) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'EDITOR') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin', req.url)));
    }
  }
  
  return applySecurityHeaders(NextResponse.next());
}

// Next.js standard export alias for universal compatibility
export const middleware = proxy;

// Intercept auth, admin, dashboard, and public api routes for security and rate limiting
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
};
