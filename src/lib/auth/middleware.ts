import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  photoURL?: string;
}

export interface AdminUser extends AuthenticatedUser {
  isAdmin: true;
}

/**
 * Extract and verify Firebase ID token from request
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header format");
  }
  
  const idToken = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (!idToken) {
    throw new Error("Missing ID token");
  }
  
  // Dynamic import to avoid client-side bundling
  const { verifyIdTokenServer } = await import("../firebase/admin-simple");
  const decodedToken = await verifyIdTokenServer(idToken);
  
  // Return user information
  return {
    uid: decodedToken.uid,
    email: decodedToken.email || "",
    emailVerified: decodedToken.email_verified || false,
    name: decodedToken.name,
    photoURL: decodedToken.picture,
  };
}

/**
 * Authenticate and verify admin role
 */
export async function authenticateAdmin(request: NextRequest): Promise<AdminUser> {
  // First authenticate the user
  const user = await authenticateRequest(request);
  
  // Then verify admin role
  const { verifyAdminRoleServer } = await import("../firebase/admin-simple");
  const isAdmin = await verifyAdminRoleServer(user.uid);
  
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  
  return {
    ...user,
    isAdmin: true,
  };
}

/**
 * Middleware function to protect API routes
 */
export function withAuth(handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await authenticateRequest(request);
      return await handler(request, user);
    } catch (error) {
      console.error("Authentication error:", error);
      
      const message = error instanceof Error ? error.message : "Authentication failed";
      const status = message.includes("Missing") ? 401 : 
                     message.includes("Invalid") ? 401 : 
                     message.includes("token") ? 401 : 403;
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }
  };
}

/**
 * Middleware function to protect admin API routes
 */
export function withAdminAuth(handler: (req: NextRequest, admin: AdminUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const admin = await authenticateAdmin(request);
      return await handler(request, admin);
    } catch (error) {
      console.error("Admin authentication error:", error);
      
      const message = error instanceof Error ? error.message : "Admin authentication failed";
      const status = message.includes("Missing") ? 401 : 
                     message.includes("Invalid") ? 401 : 
                     message.includes("token") ? 401 : 
                     message.includes("Admin") ? 403 : 500;
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }
  };
}

/**
 * Get user from request (for routes that don't require authentication but benefit from user context)
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
