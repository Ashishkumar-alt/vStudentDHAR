"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
  }, [user, loading, router, pathname]);

  if (loading) return <p className="text-sm text-zinc-600">Loading…</p>;
  if (!user) return <p className="text-sm text-zinc-600">Redirecting…</p>;
  return children;
}

