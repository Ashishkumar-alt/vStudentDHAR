"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // EMERGENCY BYPASS: Allow admin access for specific email
  const userEmail = user?.email?.toLowerCase();
  const isBypassAdmin = userEmail === "vstudent343@gmail.com";

  console.log('🔐 AdminGuard: State', { 
    user: !!user, 
    loading, 
    userEmail,
    isBypassAdmin,
    pathname
  });

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

    // EMERGENCY BYPASS: Allow access if user is the admin email
    if (isBypassAdmin) {
      console.log('🔐 AdminGuard: ✅ Emergency bypass - access granted for admin email');
      return;
    }

    // For other users, check Firestore role (simplified)
    const checkRole = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { getDb } = await import("@/lib/firebase/db");
        
        const db = getDb();
        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const hasAdminRole = userData.role === "admin";

          console.log('🔐 AdminGuard: Firestore role check', {
            email: user.email,
            role: userData.role,
            isAdmin: hasAdminRole
          });

          if (!hasAdminRole && pathname === "/admin") {
            console.log('🔐 AdminGuard: Access denied - user is not admin');
            router.replace("/");
          }
        } else if (pathname === "/admin") {
          console.log('🔐 AdminGuard: No user document, access denied');
          router.replace("/");
        }
      } catch (error) {
        console.error('🔐 AdminGuard: Error checking role:', error);
        if (pathname === "/admin") {
          router.replace("/");
        }
      }
    };

    checkRole();
  }, [user, loading, router, pathname, isBypassAdmin]);

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

  // If user is the bypass admin, render children immediately
  if (isBypassAdmin) {
    return <>{children}</>;
  }

  // For other users, show loading while checking role
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
        <p className="text-sm text-gray-600">Verifying access...</p>
      </div>
    </div>
  );
}
