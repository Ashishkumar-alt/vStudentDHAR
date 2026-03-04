"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
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
      setGenderAllowed(nextGender);
      setMinRent(nextMin);
      setMaxRent(nextMax);
      setQ(nextQ);
      setSort(nextSort);
      setVegOnly(nextVeg);
      setHeaterIncluded(nextHeater);
      setAttachedBathroom(nextBath);
      setMaxWalk(nextWalk);
      if (nextVeg || nextHeater || nextBath || nextWalk) setShowFilters(true);
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
    if (genderAllowed && genderAllowed !== "Any") params.set("gender", genderAllowed);
    if (minRent) params.set("min", minRent);
    if (maxRent) params.set("max", maxRent);
    if (q.trim()) params.set("q", q.trim());
    if (sort !== "new") params.set("sort", sort);
    if (vegOnly) params.set("veg", "1");
    if (heaterIncluded) params.set("heater", "1");
    if (attachedBathroom) params.set("bath", "1");
    if (maxWalk) params.set("walk", maxWalk);

    const qs = params.toString();
    const next = qs ? `/rooms?${qs}` : "/rooms";
    const t = setTimeout(() => router.replace(next), 250);
    return () => clearTimeout(t);
  }, [
    area,
    genderAllowed,
    minRent,
    maxRent,
    q,
    sort,
    vegOnly,
    heaterIncluded,
    attachedBathroom,
    maxWalk,
    router,
    hydratedFromUrl,
  ]);

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
    sort,
    vegOnly,
    heaterIncluded,
    attachedBathroom,
    maxWalk,
    profile?.institution,
  ]);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <section className="rounded-3xl border border-slate-200/70 bg-slate-50/60 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Find Rooms</h1>
            <p className="mt-1 text-sm text-slate-600">Find PG & rooms in Dharamshala. Filter by area first.</p>
          </div>
          <Link className="btn btn-primary" href="/post/room">
            Post Room
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <AreaChips value={area} onChange={setArea} variant="blue" />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rooms..." />
          </div>
          <select className="select sm:w-40" value={genderAllowed} onChange={(e) => setGenderAllowed(e.target.value)}>
            {ROOM_GENDER_ALLOWED.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input className="input sm:w-36" value={minRent} onChange={(e) => setMinRent(e.target.value)} placeholder="Min rent" inputMode="numeric" />
          <input className="input sm:w-36" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} placeholder="Max rent" inputMode="numeric" />
          <button type="button" className="btn h-10 px-4 text-sm" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Hide filters" : "Filters"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-sm font-medium text-slate-700">{loading ? "Loading..." : `${filtered.length} rooms available`}</div>
          <select className="select h-10 w-52" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="new">Sort by: Newest</option>
            <option value="priceAsc">Sort by: Price low → high</option>
            <option value="priceDesc">Sort by: Price high → low</option>
          </select>
        </div>

        {showFilters ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" className="h-4 w-4" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
                Veg only
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" className="h-4 w-4" checked={attachedBathroom} onChange={(e) => setAttachedBathroom(e.target.checked)} />
                Attached bathroom
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" className="h-4 w-4" checked={heaterIncluded} onChange={(e) => setHeaterIncluded(e.target.checked)} />
                Winter ready (heater)
              </label>
              <div className="min-w-[200px]">
                <label className="text-xs font-medium text-zinc-600">Walking distance to {PRIMARY_INSTITUTION_SHORT} (max minutes)</label>
                <input className="input mt-1" value={maxWalk} onChange={(e) => setMaxWalk(e.target.value)} placeholder="e.g. 10" inputMode="numeric" />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)}
      </div>

      {!loading && !filtered.length ? <p className="mt-10 text-center text-sm text-zinc-600">No rooms found. Try changing filters.</p> : null}
    </main>
  );
}

