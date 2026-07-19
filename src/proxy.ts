import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  // Extract token directly, bypassing withAuth's internal redirect black-box
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const path = req.nextUrl.pathname;
  
  // Normalize role string for safe comparison (handles existing legacy lowercase roles if any)
  const userRole = token?.role ? (token.role as string).toUpperCase() : "CLIENT";

  // 1. Ignore Auth Routes for unauthenticated users, but redirect authenticated ones
  if (path.startsWith('/auth')) {
    if (token) {
      if (userRole === 'SUPER_ADMIN' || userRole === 'EDITOR') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected routes
  if (!token && (path.startsWith('/admin') || path.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // 2. Client users trying to access admin routes
  if (path.startsWith('/admin')) {
    if (userRole === 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. Admin users trying to access client dashboard
  if (path.startsWith('/dashboard')) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'EDITOR') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }
  
  return NextResponse.next();
}

// Run the middleware on auth, admin, and dashboard routes
export const config = { matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*"] }
