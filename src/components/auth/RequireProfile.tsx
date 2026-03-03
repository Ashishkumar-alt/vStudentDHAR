"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function RequireProfile({ children }: { children: React.ReactNode }) {
  const { user, loading, profileComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (!profileComplete) {
      router.replace(`/profile?next=${encodeURIComponent(pathname || "/")}`);
    }
  }, [user, loading, profileComplete, router, pathname]);

  if (loading) return <p className="text-sm text-zinc-600">Loading…</p>;
  if (!user) return <p className="text-sm text-zinc-600">Redirecting…</p>;
  if (!profileComplete) return <p className="text-sm text-zinc-600">Complete profile…</p>;
  return children;
}
