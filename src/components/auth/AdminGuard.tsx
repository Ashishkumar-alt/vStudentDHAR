"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { isAdminEmail } from "@/constants/admin";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Debug logs
  console.log("🔐 AdminGuard - Auth state:", {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    pathname
  });

  useEffect(() => {
    // Wait for auth state to be ready
    if (loading) {
      console.log("🔐 AdminGuard - Auth still loading, waiting...");
      return;
    }

    // Check if user is logged in
    if (!user) {
      console.log("🔐 AdminGuard - No user, redirecting to login");
      const nextUrl = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${nextUrl}`);
      return;
    }

    // Check if user is admin
    const isAdmin = isAdminEmail(user.email || undefined);
    console.log("🔐 AdminGuard - Admin check:", {
      userEmail: user.email,
      isAdmin,
      ADMIN_EMAIL: "vstudent343@gmail.com"
    });

    // If on admin page and not admin, redirect
    if (pathname === "/admin" && !isAdmin) {
      console.log("🔐 AdminGuard - Access denied, redirecting to login");
      router.replace("/login?message=Admin+access+required");
      return;
    }

    console.log("🔐 AdminGuard - ✅ Access granted");
  }, [user, loading, router, pathname]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking admin access
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

  // If user is not admin and trying to access admin page
  if (!isAdminEmail(user.email || undefined) && pathname === "/admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4 text-4xl">🚫</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mb-4 text-sm text-gray-600">
            Admin access required. You're logged in as {user.email} but don't have admin privileges.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="w-full btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Allow access
  return <>{children}</>;
}
