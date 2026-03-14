"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/db";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) {
      console.log('🔐 AdminGuard: Auth still loading, waiting...');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      console.log('🔐 AdminGuard: No user found, redirecting to login');
      const nextUrl = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${nextUrl}`);
      return;
    }

    // User exists, check admin role from Firestore
    const checkAdminRole = async () => {
      console.log('🔐 AdminGuard: Checking admin role for', user.email);
      setCheckingRole(true);

      try {
        const db = getDb();
        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData.role;
          const hasAdminRole = userRole === "admin";

          console.log('🔐 AdminGuard: User role found', {
            email: user.email,
            role: userRole,
            isAdmin: hasAdminRole
          });

          setIsAdmin(hasAdminRole);
        } else {
          console.log('🔐 AdminGuard: No user document found, creating one with user role');
          // Create user document if it doesn't exist
          const { setDoc, serverTimestamp } = await import("firebase/firestore");
          await setDoc(userDoc, {
            email: user.email,
            role: "user", // Default to user, not admin
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('🔐 AdminGuard: Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
        setAdminChecked(true);
      }
    };

    checkAdminRole();
  }, [user, loading, router, pathname]);

  useEffect(() => {
    // Only proceed after both auth and role check are complete
    if (!loading && adminChecked && !checkingRole) {
      console.log('🔐 AdminGuard: Final check', {
        hasUser: !!user,
        isAdmin,
        pathname
      });

      // If on admin page and user is not admin, redirect to home
      if (pathname === "/admin" && !isAdmin) {
        console.log('🔐 AdminGuard: Access denied - user is not admin');
        router.replace("/");
        return;
      }

      console.log('🔐 AdminGuard: ✅ Access granted');
    }
  }, [loading, adminChecked, checkingRole, isAdmin, user, router, pathname]);

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

  // Show loading while checking admin role
  if (checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-sm text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show loading if admin check hasn't completed yet
  if (!adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
          <p className="text-sm text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If user exists but admin check failed and on admin page
  if (user && !isAdmin && pathname === "/admin") {
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

  // If everything checks out, render children
  return <>{children}</>;
}
