import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maintenance mode controlled by environment variable
const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

// Developer access bypass conditions
function shouldBypassMaintenance(request: NextRequest): boolean {
  // Bypass for localhost development
  const isLocalhost = request.headers.get("host")?.includes("localhost");
  
  // Bypass with DEV_ACCESS environment variable
  const devAccess = request.nextUrl.searchParams.get("DEV_ACCESS") === "true";
  
  return isLocalhost || devAccess;
}

// Admin routes that require server-side protection
const ADMIN_ROUTES = [
  "/admin",
  "/admin/",
  "/api/admin"
];

// Protected API routes that require authentication
const PROTECTED_API_ROUTES = [
  "/api/listings/create",
  "/api/listings/update", 
  "/api/listings/delete",
  "/api/user/profile",
  "/api/favorites"
];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for maintenance page to avoid infinite loop
  if (pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  // Skip middleware for static assets and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest.webmanifest") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) {
    return NextResponse.next();
  }

  // Check if developer should bypass maintenance
  if (shouldBypassMaintenance(request)) {
    return NextResponse.next();
  }

  // If maintenance mode is enabled, redirect to maintenance page
  if (MAINTENANCE_MODE) {
    const maintenanceUrl = new URL("/maintenance", request.url);
    return NextResponse.redirect(maintenanceUrl);
  }

  // For admin routes, redirect to login (client-side will handle verification)
  if (isAdminRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("message", "Admin access required");
    return NextResponse.redirect(loginUrl);
  }

  // For protected API routes, let them handle their own auth
  if (isProtectedApiRoute(pathname)) {
    return NextResponse.next();
  }

  // For other routes, continue normally (client-side will handle auth)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/public (public API routes)
     * - maintenance (maintenance page itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/public|maintenance).*)",
  ],
};
