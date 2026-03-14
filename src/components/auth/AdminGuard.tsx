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

  // Show loading while auth is initializing - this is the FIRST and MOST IMPORTANT check
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

  // At this point, loading is false, so we can safely check user and admin status
  const isAdmin = isAdminEmail(user?.email || undefined);
  
  console.log("🔐 AdminGuard - Final check (loading: false):", {
    hasUser: !!user,
    userEmail: user?.email,
    isAdmin,
    pathname
  });

  // If no user when loading is complete, redirect to login
  if (!user) {
    console.log("🔐 AdminGuard - No user after loading, redirecting to login");
    const nextUrl = encodeURIComponent(pathname || "/");
    router.replace(`/login?next=${nextUrl}`);
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If user exists but not admin and trying to access admin page
  if (!isAdmin && pathname === "/admin") {
    console.log("🔐 AdminGuard - Access denied, user is not admin");
    router.replace("/login?message=Admin+access+required");
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

  // If we reach here, user is authenticated and has admin access (or not trying to access admin page)
  console.log("🔐 AdminGuard - ✅ Access granted");
  return <>{children}</>;
}
