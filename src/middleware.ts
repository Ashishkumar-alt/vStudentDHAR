import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maintenance mode flag - set to true to enable maintenance mode
const MAINTENANCE_MODE = true;

// Developer access bypass conditions
function shouldBypassMaintenance(request: NextRequest): boolean {
  // Bypass for localhost development
  const isLocalhost = request.headers.get("host")?.includes("localhost");
  
  // Bypass with DEV_ACCESS environment variable
  const devAccess = request.nextUrl.searchParams.get("DEV_ACCESS") === "true";
  
  return isLocalhost || devAccess;
}

export function middleware(request: NextRequest) {
  // Skip middleware for maintenance page to avoid infinite loop
  if (request.nextUrl.pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  // Skip middleware for static assets and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/manifest.webmanifest")
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
