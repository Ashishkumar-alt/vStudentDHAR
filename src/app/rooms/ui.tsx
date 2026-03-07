"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SearchX } from "lucide-react";
import { PRIMARY_INSTITUTION_SHORT, ROOM_GENDER_ALLOWED } from "@/lib/constants";
import { asNumber } from "@/lib/utils";
import { RoomCard } from "@/components/listings/ListingCard";
import { useRooms } from "@/components/listings/useListings";
import AreaChips from "@/components/ui/AreaChips";
import { useAuth } from "@/components/auth/AuthProvider";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function RoomsClient() {
  const router = useRouter();
  const search = useSearchParams();
  const { profile } = useAuth();

  const [area, setArea] = useState<string>("");
  const [genderAllowed, setGenderAllowed] = useState<string>("Any");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<"new" | "priceAsc" | "priceDesc">("new");
  const [vegOnly, setVegOnly] = useState(false);
  const [heaterIncluded, setHeaterIncluded] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);
  const [maxWalk, setMaxWalk] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  const { rows, loading, error } = useRooms();

  useEffect(() => {
    if (hydratedFromUrl) return;

    const nextArea = search.get("area") || "";
    const nextGender = search.get("gender") || "Any";
    const nextMin = search.get("min") || "";
    const nextMax = search.get("max") || "";
    const nextQ = search.get("q") || "";
    const nextSort = (search.get("sort") as "new" | "priceAsc" | "priceDesc" | null) || "new";
    const nextVeg = search.get("veg") === "1";
    const nextHeater = search.get("heater") === "1";
    const nextBath = search.get("bath") === "1";
    const nextWalk = search.get("walk") || "";

    const t = setTimeout(() => {
      if (nextArea) setArea(nextArea);
      if (nextGender) setGenderAllowed(nextGender);
      if (nextMin) setMinRent(nextMin);
      if (nextMax) setMaxRent(nextMax);
      if (nextQ) setQ(nextQ);
      if (nextSort) setSort(nextSort);
      if (nextVeg) setVegOnly(true);
      if (nextHeater) setHeaterIncluded(true);
      if (nextBath) setAttachedBathroom(true);
      if (nextWalk) setMaxWalk(nextWalk);
      setHydratedFromUrl(true);
    }, 0);

    return () => clearTimeout(t);
  }, [search, hydratedFromUrl]);

  useEffect(() => {
    if (!hydratedFromUrl && area) {
      const t = setTimeout(() => {
        router.replace(`/rooms?area=${encodeURIComponent(area)}`);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [area, hydratedFromUrl]);

  const filtered = useMemo(() => {
    const min = asNumber(minRent);
    const max = asNumber(maxRent);
    const walkMax = asNumber(maxWalk);
    const keyword = q.trim().toLowerCase();

    const base = rows.filter(({ data }) => {
      if (area && data.area !== area) return false;
      if (genderAllowed !== "Any" && data.genderAllowed !== genderAllowed) return false;
      if (min !== null && data.rent < min) return false;
      if (max !== null && data.rent > max) return false;
      if (keyword && !data.title.toLowerCase().includes(keyword)) return false;
      if (vegOnly && !data.vegOnly) return false;
      if (heaterIncluded && !data.heaterIncluded) return false;
      if (attachedBathroom && !data.attachedBathroom) return false;

      if (walkMax !== null) {
        const v = typeof data.walkMinutesToHPU === "number" ? data.walkMinutesToHPU : null;
        if (v === null || v > walkMax) return false;
      }

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

      if (sort === "priceAsc") return a.data.rent - b.data.rent;
      if (sort === "priceDesc") return b.data.rent - a.data.rent;

      return (b.data.createdAt?.toMillis?.() || 0) - (a.data.createdAt?.toMillis?.() || 0);
    });
  }, [
    rows,
    area,
    genderAllowed,
    minRent,
    maxRent,
    q,
    vegOnly,
    heaterIncluded,
    attachedBathroom,
    maxWalk,
    sort,
    profile?.institution,
  ]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      area ||
        q.trim() ||
        (genderAllowed && genderAllowed !== "Any") ||
        minRent ||
        maxRent ||
        vegOnly ||
        heaterIncluded ||
        attachedBathroom ||
        maxWalk,
    );
  }, [area, q, genderAllowed, minRent, maxRent, vegOnly, heaterIncluded, attachedBathroom, maxWalk]);

  const clearAll = () => {
    setArea("");
    setQ("");
    setGenderAllowed("Any");
    setMinRent("");
    setMaxRent("");
    setVegOnly(false);
    setHeaterIncluded(false);
    setAttachedBathroom(false);
    setMaxWalk("");
    setShowFilters(false);
  };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 px-6 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find Rooms</h1>
              <p className="mt-1 text-sm text-white/80">Find PG & rooms in Dharamshala. Filter by area first.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link className="btn bg-white text-blue-600 hover:bg-gray-50" href="/post/room">
                Post Room
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">

          {/* Location Navigation */}
          <div className="rounded-2xl bg-[color:var(--card-2)] p-3 ring-1 ring-[color:var(--border)]">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <Link 
                href="/rooms/dharamshala" 
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors min-h-[2.5rem]"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">Dharamshala</span>
              </Link>
              <Link 
                href="/rooms/mcleodganj" 
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors min-h-[2.5rem]"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">McLeod Ganj</span>
              </Link>
              <Link 
                href="/rooms/sidhbari" 
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors min-h-[2.5rem]"
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">Sidhbari</span>
              </Link>
              <Link 
                href="/rooms/central-university" 
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors min-h-[2.5rem]"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">Central University</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_9rem_9rem_auto] lg:items-center">
            <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:color-mix(in srgb, var(--muted) 75%, transparent)]" />
              <input
                className="input pl-9 w-full"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title (e.g. sun facing, single room)"
              />
            </div>
            <select className="select h-10 w-full" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="new">Sort by: Newest</option>
              <option value="priceAsc">Sort by: Price low to high</option>
              <option value="priceDesc">Sort by: Price high to low</option>
            </select>
            <input className="input w-full" value={minRent} onChange={(e) => setMinRent(e.target.value)} placeholder="Min rent (₹)" inputMode="numeric" />
            <input className="input w-full" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} placeholder="Max rent (₹)" inputMode="numeric" />
            <select className="select w-full" value={genderAllowed} onChange={(e) => setGenderAllowed(e.target.value)}>
              {ROOM_GENDER_ALLOWED.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          filtered.map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)
        )}
      </div>

      {!loading && !filtered.length ? (
        <div className="mt-8">
          <div className="card mx-auto max-w-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <SearchX className="h-6 w-6" />
            </div>
            <div className="mt-4 text-lg font-semibold">No rooms match these filters</div>
            <p className="mt-1 text-sm text-slate-600">Try removing a filter, changing the area, or posting a listing.</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button type="button" className="btn" onClick={clearAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset filters
              </button>
              <Link className="btn btn-primary" href="/post/room">
                Post Room
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}