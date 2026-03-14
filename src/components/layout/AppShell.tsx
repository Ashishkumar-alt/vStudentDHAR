"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CONTACT_EMAIL, DEFAULT_CITY_LABEL } from "@/lib/constants";
import { ADMIN_EMAIL } from "@/constants/admin";
import { Home, House, ShoppingBag, Plus, User, Shield, Menu, X, Heart } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { watchIsAdmin } from "@/lib/firebase/admin";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import MobilePostButton from "@/components/navigation/MobileBottomNav";
import FeatureGate from "@/components/ui/FeatureGate";

// Client-only component to avoid hydration mismatch
function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

function NavPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[color:var(--card)] text-[color:var(--foreground)] shadow-sm ring-1 ring-[color:var(--border)]"
          : "text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-[color:color-mix(in srgb, var(--card) 65%, transparent)]",
      ].join(" ")}
    >
      <span className="opacity-80">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOutNow } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/logo.png");
  
  // Simple admin check based on email
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  console.log(" AppShell - Admin status:", {
    userEmail: user?.email,
    isAdmin,
    ADMIN_EMAIL
  });

  const isMaintenancePage = pathname?.startsWith("/maintenance");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const unsubscribe = watchIsAdmin(
      user.uid,
      (admin: boolean) => setIsAdmin(admin),
      () => setIsAdmin(false)
    );

    return unsubscribe;
  }, [user]);

  return (
    <div className="min-h-dvh bg-transparent">

      {/* HEADER */}
      {!isMaintenancePage && (
        <header className="sticky top-0 z-40 border-b border-[color:var(--border)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--card)] shadow-sm ring-1 ring-[color:var(--border)]">
                  <Image
                    src={logoSrc}
                    alt="vStudent"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-2xl object-contain"
                    priority
                    onError={() => setLogoSrc("/logo.svg")}
                  />
                </span>
                <span className="text-base text-[color:var(--foreground)]">vStudent</span>
              </Link>

              <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2 py-0.5 text-xs text-[color:var(--muted)] sm:inline">
                {DEFAULT_CITY_LABEL}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--card)] p-1 ring-1 ring-[color:var(--border)] sm:flex">
              <NavPill href="/" label="Home" icon={<Home className="h-4 w-4" />} />
              <NavPill href="/rooms" label="Rooms" icon={<House className="h-4 w-4" />} />

              <FeatureGate feature="ITEMS_FEATURE_ENABLED">
                <NavPill href="/items" label="Items" icon={<ShoppingBag className="h-4 w-4" />} />
              </FeatureGate>

              <NavPill href="/saved" label="Saved" icon={<Heart className="h-4 w-4" />} />
              <NavPill href="/my-listings" label="My Listings" icon={<User className="h-4 w-4" />} />
            </nav>

            {/* Mobile Menu Button */}
            <div className="relative sm:hidden">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
                onClick={() => setMobileMenuOpen(prev => !prev)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[color:var(--border)] bg-white shadow-lg">
                <div className="p-2">
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <Link
                      href="/saved"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Saved
                    </Link>
                    <Link
                      href="/my-listings"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Listings
                    </Link>
                    {user ? (
                      <>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Admin
                          </Link>
                        )}
                        <button
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                          onClick={() => {
                            signOutNow();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <User className="h-4 w-4" />
                          Sign out
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 sm:flex">
              <button className="btn h-9 w-9 px-0" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {user ? (
                <>
                  <Link className="btn btn-primary h-9 px-4 text-sm" href="/post">
                    <Plus className="mr-2 h-4 w-4" />
                    Post
                  </Link>

                  <Link className="btn h-9 px-4 text-sm" href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link className="btn h-9 px-4 text-sm" href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <button className="btn h-9 px-4 text-sm" onClick={signOutNow}>
                    Sign out
                  </button>
                </>
              ) : (
                <Link className="btn btn-primary h-9 px-4 text-sm" href="/login">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 sm:pb-0">
        {children}
      </main>

      {/* MOBILE NAVIGATION */}
      <ClientOnly>
        <div className="sm:hidden">
          <MobileBottomNav />
          <MobilePostButton />
        </div>
      </ClientOnly>

      {/* DESKTOP FOOTER */}
      <footer className="hidden sm:block mx-auto w-full max-w-screen-2xl px-4 pt-10 pb-10 text-center text-xs text-[color:var(--muted)]">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <span> 2026 vStudent. All Rights Reserved.</span>

          <span className="hidden sm:inline">•</span>

          <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link className="underline underline-offset-4 hover:text-[color:var(--foreground)]" href="/about">
              About
            </Link>
            <Link className="underline underline-offset-4 hover:text-[color:var(--foreground)]" href="/privacy">
              Privacy
            </Link>
            <Link className="underline underline-offset-4 hover:text-[color:var(--foreground)]" href="/terms">
              Terms
            </Link>
            <a className="underline underline-offset-4 hover:text-[color:var(--foreground)]" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </span>
        </div>
      </footer>

    </div>
  );
}