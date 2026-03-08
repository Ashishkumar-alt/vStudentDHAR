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

// Admin routes that require protection
const ADMIN_ROUTES = [
  "/admin",
  "/admin/",
  "/admin/listings",
  "/admin/users",
  "/admin/reports",
  "/admin/settings",
  "/admin/logs"
];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for maintenance page to avoid infinite loop
  if (pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  // Skip middleware for static assets and API routes (except admin API)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest.webmanifest")
  ) {
    return NextResponse.next();
  }

  // Allow API routes to continue (they handle their own auth)
  if (pathname.startsWith("/api")) {
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

  // For admin routes, we'll let the client-side authentication handle it
  // The RequireAuth component will handle redirecting non-admin users
  if (isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  // Otherwise, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - maintenance (maintenance page itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|maintenance).*)",
  ],
};
