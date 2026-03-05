"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CONTACT_EMAIL, DEFAULT_CITY_LABEL } from "@/lib/constants";
import { Home, House, ShoppingBag, Plus, User, Shield, Menu, X, Heart } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

function NavPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
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
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");

  useEffect(() => {
    // Close the mobile menu on route change (lint rule disallows setState directly in effects here).
    setTimeout(() => setMobileMenuOpen(false), 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-transparent">
      <header className="app-header sticky top-0 z-20 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
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
              <span className="text-base text-slate-900">vStudent</span>
            </Link>
            <span className="hidden rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 sm:inline">
              {DEFAULT_CITY_LABEL}
            </span>
          </div>

          <nav className="hidden items-center gap-1 rounded-full bg-slate-100/70 p-1 sm:flex">
            <NavPill href="/" label="Home" icon={<Home className="h-4 w-4" />} />
            <NavPill href="/rooms" label="Rooms" icon={<House className="h-4 w-4" />} />
            <NavPill href="/items" label="Items" icon={<ShoppingBag className="h-4 w-4" />} />
            <NavPill href="/saved" label="Saved" icon={<Heart className="h-4 w-4" />} />
            <NavPill href="/my-listings" label="My Listings" icon={<User className="h-4 w-4" />} />
          </nav>

          {/* Mobile menu button */}
          <div className="relative sm:hidden">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {mobileMenuOpen ? (
              <div className="app-mobile-menu absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-3">
                  <div className="text-xs font-medium text-slate-600">{DEFAULT_CITY_LABEL}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {loading ? "Loading..." : user?.email || "Guest"}
                  </div>
                </div>

                <div className="p-2">
                  {user ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={toggleTheme}
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </span>
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </button>
                      <MenuLink href="/post" label="Post" icon={<Plus className="h-4 w-4" />} />
                      <MenuLink href="/saved" label="Saved" icon={<Heart className="h-4 w-4" />} />
                      <MenuLink href="/my-listings" label="My Listings" icon={<House className="h-4 w-4" />} />
                      <MenuLink href="/profile" label="Profile" icon={<User className="h-4 w-4" />} />
                      <MenuLink href="/admin" label="Admin" icon={<Shield className="h-4 w-4" />} />
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={signOutNow}
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          <X className="h-4 w-4" />
                        </span>
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={toggleTheme}
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </span>
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </button>
                      <MenuLink href="/login" label="Sign in" icon={<User className="h-4 w-4" />} />
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Desktop actions only (mobile uses bottom nav) */}
          <div className="hidden items-center gap-2 sm:flex">
            {loading ? (
              <span className="text-xs text-slate-500">Loading...</span>
            ) : user ? (
              <>
                <button className="btn h-9 w-9 px-0 text-sm" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link className="btn btn-primary h-9 px-4 text-sm" href="/post">
                  <Plus className="mr-2 h-4 w-4" />
                  Post
                </Link>
                <Link className="btn h-9 px-4 text-sm" href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <Link className="btn h-9 px-4 text-sm" href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Link>
                <button className="btn h-9 px-4 text-sm" onClick={signOutNow}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button className="btn h-9 w-9 px-0 text-sm" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link className="btn btn-primary h-9 px-4 text-sm" href="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="pb-16 sm:pb-0">{children}</div>

      <nav className="app-bottom-nav fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur sm:hidden">
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-4 gap-1 px-2 py-2">
          <MobileTab href="/rooms" label="Rooms" icon="rooms" />
          <MobileTab href="/items" label="Items" icon="items" />
          <MobileTab href="/post" label="Post" icon="post" />
          <MobileTab href="/profile" label="Me" icon="me" />
        </div>
      </nav>

      <footer className="mx-auto w-full max-w-screen-2xl px-4 pt-10 pb-24 text-center text-xs text-slate-500 sm:py-10">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <span>© 2026 vStudent. All Rights Reserved.</span>
          <span className="hidden text-slate-300 sm:inline">•</span>
          <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link className="underline underline-offset-4 hover:text-slate-700" href="/privacy">
              Privacy
            </Link>
            <Link className="underline underline-offset-4 hover:text-slate-700" href="/terms">
              Terms
            </Link>
            <a className="underline underline-offset-4 hover:text-slate-700" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function MenuLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">{icon}</span>
      {label}
    </Link>
  );
}

function MobileTab({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "rooms" | "items" | "post" | "me";
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  const IconEl =
    icon === "rooms" ? House : icon === "items" ? ShoppingBag : icon === "post" ? Plus : User;
  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px]",
        active ? "text-slate-900" : "text-slate-500",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-2xl",
          active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
        ].join(" ")}
      >
        <IconEl className="h-5 w-5" />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
