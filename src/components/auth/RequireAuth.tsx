"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth state to be determined
    if (loading) return;

    // If no user, redirect to login
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // If on admin page and user is not admin, redirect to home
    if (pathname === "/admin" && !isAdmin) {
      router.replace("/");
      return;
    }
  }, [user, loading, isAdmin, router, pathname]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--border)] border-t-[color:var(--foreground)]"></div>
          <p className="text-sm text-[color:var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if no user
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--muted)]">Redirecting to login...</p>
      </div>
    );
  }

  // Show access denied if on admin page but not admin
  if (pathname === "/admin" && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">🚫</div>
          <h2 className="mb-2 text-lg font-semibold">Access Denied</h2>
          <p className="mb-4 text-sm text-[color:var(--muted)]">Admin access required</p>
          <button
            onClick={() => router.replace("/")}
            className="btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}

