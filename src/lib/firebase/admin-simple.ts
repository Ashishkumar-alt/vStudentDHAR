// Simple admin verification for API routes only
// This file will only be used in server-side API routes

// These functions will be dynamically imported in API routes to avoid client-side bundling
export async function verifyIdTokenServer(idToken: string) {
  try {
    // Dynamic import to avoid client-side bundling
    const adminModule = await import('./admin-server');
    
    const decodedToken = await adminModule.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token");
  }
}

export async function verifyAdminRoleServer(uid: string) {
  try {
    // Dynamic import to avoid client-side bundling
    const adminModule = await import('./admin-server');
    
    const isAdmin = await adminModule.verifyAdminRole(uid);
    return isAdmin;
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return false;
  }
}
