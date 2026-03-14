"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // TEMPORARY: Force admin access for vstudent343@gmail.com
  const userEmail = user?.email?.toLowerCase();
  const isTempAdmin = userEmail === "vstudent343@gmail.com";
  const finalIsAdmin = isAdmin || isTempAdmin;

  console.log('🛡️ RequireAuth: State', { 
    user: !!user, 
    loading, 
    isAdmin, 
    finalIsAdmin,
    userEmail,
    pathname,
    userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  });

  useEffect(() => {
    console.log('🛡️ RequireAuth: useEffect', { loading, user: !!user, finalIsAdmin, pathname });
    
    // Wait for auth state to be determined
    if (loading) {
      console.log('🛡️ RequireAuth: Still loading, waiting...');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      console.log('🛡️ RequireAuth: No user, redirecting to login');
      const nextUrl = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${nextUrl}`);
      return;
    }

    // If on admin page and user is not admin, redirect to home
    if (pathname === "/admin" && !finalIsAdmin) {
      console.log('🛡️ RequireAuth: User not admin, redirecting to home', {
        userEmail: user.email,
        isAdmin: finalIsAdmin,
        originalIsAdmin: isAdmin,
        tempAdmin: isTempAdmin
      });
      router.replace("/");
      return;
    }

    console.log('🛡️ RequireAuth: ✅ Access granted');
  }, [user, loading, finalIsAdmin, router, pathname]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
          <p className="text-xs text-gray-400">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if no user
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show access denied if on admin page but not admin
  if (pathname === "/admin" && !finalIsAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4 text-4xl">🚫</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mb-4 text-sm text-gray-600">
            Admin access required. You're logged in as {user.email} but don't have admin privileges.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.replace("/")}
              className="w-full btn btn-primary"
            >
              Go to Home
            </button>
            <button
              onClick={() => router.replace("/my-listings")}
              className="w-full btn"
            >
              My Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

