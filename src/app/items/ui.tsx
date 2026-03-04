"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { ITEM_CATEGORIES, ITEM_CONDITION } from "@/lib/constants";
import { asNumber } from "@/lib/utils";
import { ItemCard } from "@/components/listings/ListingCard";
import { useItems } from "@/components/listings/useListings";
import AreaChips from "@/components/ui/AreaChips";
import { useAuth } from "@/components/auth/AuthProvider";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function ItemsClient() {
  const router = useRouter();
  const search = useSearchParams();
  const { profile } = useAuth();

  const [area, setArea] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<"new" | "priceAsc" | "priceDesc">("new");
  const [showFilters, setShowFilters] = useState(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  const { rows, loading, error } = useItems();

  useEffect(() => {
    if (hydratedFromUrl) return;

    const nextArea = search.get("area") || "";
    const nextCategory = search.get("cat") || "";
    const nextCondition = search.get("cond") || "";
    const nextMin = search.get("min") || "";
    const nextMax = search.get("max") || "";
    const nextQ = search.get("q") || "";
    const nextSort = (search.get("sort") as "new" | "priceAsc" | "priceDesc" | null) || "new";

    const t = setTimeout(() => {
      if (nextArea) setArea(nextArea);
      setCategory(nextCategory);
      setCondition(nextCondition);
      setMinPrice(nextMin);
      setMaxPrice(nextMax);
      setQ(nextQ);
      setSort(nextSort);
      if (nextCategory || nextCondition) setShowFilters(true);
      setHydratedFromUrl(true);
    }, 0);

    return () => clearTimeout(t);
  }, [search, hydratedFromUrl]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("vstudent.area") || "";
      if (!search.get("area") && saved) setTimeout(() => setArea(saved), 0);
    } catch {}
  }, [search]);

  useEffect(() => {
    try {
      if (area) window.localStorage.setItem("vstudent.area", area);
    } catch {}
  }, [area]);

  useEffect(() => {
    if (!hydratedFromUrl) return;
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (category) params.set("cat", category);
    if (condition) params.set("cond", condition);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (q.trim()) params.set("q", q.trim());
    if (sort !== "new") params.set("sort", sort);

    const qs = params.toString();
    const next = qs ? `/items?${qs}` : "/items";
    const t = setTimeout(() => router.replace(next), 250);
    return () => clearTimeout(t);
  }, [area, category, condition, minPrice, maxPrice, q, sort, router, hydratedFromUrl]);

  const filtered = useMemo(() => {
    const min = asNumber(minPrice);
    const max = asNumber(maxPrice);
    const keyword = q.trim().toLowerCase();
    const base = rows.filter(({ data }) => {
      if (area && data.area !== area) return false;
      if (category && data.category !== category) return false;
      if (condition && data.condition !== condition) return false;
      if (min !== null && data.price < min) return false;
      if (max !== null && data.price > max) return false;
      if (keyword && !data.title.toLowerCase().includes(keyword)) return false;
      return true;
    });
    return [...base].sort((a, b) => {
      const inst = profile?.institution;
      const score = (x: typeof a) => {
        let s = 0;
        if (area && x.data.area === area) s += 20;
        if (inst && x.data.institution === inst) s += 10;
        return s;
      };
      const ds = score(b) - score(a);
      if (ds !== 0) return ds;
      if (sort === "priceAsc") return a.data.price - b.data.price;
      if (sort === "priceDesc") return b.data.price - a.data.price;
      return (b.data.createdAt?.toMillis?.() || 0) - (a.data.createdAt?.toMillis?.() || 0);
    });
  }, [rows, area, category, condition, minPrice, maxPrice, q, sort, profile?.institution]);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <section className="rounded-3xl border border-slate-200/70 bg-slate-50/60 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Used Items</h1>
            <p className="mt-1 text-sm text-slate-600">Buy & sell student items in Dharamshala.</p>
          </div>
          <Link className="btn btn-primary" href="/post/item">
            Post Item
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <AreaChips value={area} onChange={setArea} variant="emerald" />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items..." />
          </div>
          <input className="input sm:w-36" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" inputMode="numeric" />
          <input className="input sm:w-36" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" inputMode="numeric" />
          <button type="button" className="btn h-10 px-4 text-sm" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Hide filters" : "Filters"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-sm font-medium text-slate-700">{loading ? "Loading..." : `${filtered.length} items available`}</div>
          <select className="select h-10 w-52" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="new">Sort by: Newest</option>
            <option value="priceAsc">Sort by: Price low → high</option>
            <option value="priceDesc">Sort by: Price high → low</option>
          </select>
        </div>

        {showFilters ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-zinc-600">Category</label>
                <select className="select mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Any</option>
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Condition</label>
                <select className="select mt-1" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="">Any</option>
                  {ITEM_CONDITION.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="btn w-full"
                  onClick={() => {
                    setCategory("");
                    setCondition("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map(({ id, data }) => <ItemCard key={id} id={id} listing={data} />)}
      </div>

      {!loading && !filtered.length ? <p className="mt-10 text-center text-sm text-zinc-600">No items found. Try changing filters.</p> : null}
    </main>
  );
}

