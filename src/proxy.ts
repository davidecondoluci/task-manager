import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect dashboard routes.
 *
 * Design decisions:
 * - Only protects /dashboard and /tasks routes
 * - Landing page (/) remains public
 * - API routes are not protected by middleware (handled per-route if needed)
 * - Simple cookie check, full validation happens in session lib
 *
 * Note: We only check for cookie existence here for performance.
 * Full session validation happens in server components/API routes.
 */

const PROTECTED_PATHS = ["/dashboard", "/tasks"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path needs protection
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie?.value) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths (performance optimization)
  matcher: ["/dashboard/:path*", "/tasks/:path*"],
};
