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
    <main className="mx-auto w-full max-w-screen-2xl">
      <div className="px-4 py-10 sm:px-6 sm:py-12">

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-12 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, location, or features..."
            />
          </div>
        </div>

        {/* Rooms grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)}
        </div>

        {!loading && !filtered.length ? (
          <div className="mt-8">
            <div className="card mx-auto max-w-2xl p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <SearchX className="h-6 w-6" />
              </div>
              <div className="mt-4 text-lg font-semibold">No rooms match these filters</div>
              <p className="mt-1 text-sm text-slate-600">Try removing a filter or changing the area.</p>
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

      </div>
    </main>
  );
}