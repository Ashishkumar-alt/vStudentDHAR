"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  MapPin,
} from "lucide-react";
import { DHARAMSHALA_AREAS, ROOM_GENDER_ALLOWED } from "@/lib/constants";
import { asNumber } from "@/lib/utils";
import { RoomCard } from "@/components/listings/ListingCard";
import { useRooms } from "@/components/listings/useListings";
import { CardSkeleton } from "@/components/ui/Skeleton";

type SortOption = "new" | "priceAsc" | "priceDesc";
type FilterCategory = "locality" | "budget" | "gender" | "amenities" | "services";

type FilterDraft = {
  area: string;
  genderAllowed: string;
  minRent: string;
  maxRent: string;
  vegOnly: boolean;
  heaterIncluded: boolean;
  attachedBathroom: boolean;
  maxWalk: string;
};

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "new", label: "Newest" },
];

const filterCategories: Array<{ value: FilterCategory; label: string }> = [
  { value: "locality", label: "Locality" },
  { value: "budget", label: "Budget" },
  { value: "gender", label: "Gender" },
  { value: "amenities", label: "Amenities" },
  { value: "services", label: "Services" },
];

const budgetPresets = [
  { label: "Below Rs 5,000", min: "", max: "5000" },
  { label: "Rs 5,000 - 8,000", min: "5000", max: "8000" },
  { label: "Rs 8,000 - 12,000", min: "8000", max: "12000" },
  { label: "Above Rs 12,000", min: "12000", max: "" },
] as const;

function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "fixed inset-0 z-40 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <div
        className={[
          "absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-b-0 border-[color:var(--border)] bg-[color:var(--background)] p-5 shadow-2xl transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-300" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pb-3">{children}</div>
      </div>
    </div>
  );
}

export default function RoomsClient() {
  const router = useRouter();
  const search = useSearchParams();

  const [area, setArea] = useState<string>("");
  const [genderAllowed, setGenderAllowed] = useState<string>("Any");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("new");
  const [vegOnly, setVegOnly] = useState(false);
  const [heaterIncluded, setHeaterIncluded] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);
  const [maxWalk, setMaxWalk] = useState<string>("");
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);
  const [draftSort, setDraftSort] = useState<SortOption>("new");
  const [draftFilters, setDraftFilters] = useState<FilterDraft>({
    area: "",
    genderAllowed: "Any",
    minRent: "",
    maxRent: "",
    vegOnly: false,
    heaterIncluded: false,
    attachedBathroom: false,
    maxWalk: "",
  });
  const [activeFilterCategory, setActiveFilterCategory] = useState<FilterCategory>("locality");

  const { rows, loading, error } = useRooms();

  useEffect(() => {
    if (hydratedFromUrl) return;

    const nextArea = search.get("area") || "";
    const nextGender = search.get("gender") || "Any";
    const nextMin = search.get("min") || "";
    const nextMax = search.get("max") || "";
    const nextQ = search.get("q") || "";
    const nextSort = (search.get("sort") as SortOption | null) || "new";
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
    if (!hydratedFromUrl) return;

    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (genderAllowed !== "Any") params.set("gender", genderAllowed);
    if (minRent) params.set("min", minRent);
    if (maxRent) params.set("max", maxRent);
    if (q.trim()) params.set("q", q.trim());
    if (sort !== "new") params.set("sort", sort);
    if (vegOnly) params.set("veg", "1");
    if (heaterIncluded) params.set("heater", "1");
    if (attachedBathroom) params.set("bath", "1");
    if (maxWalk) params.set("walk", maxWalk);

    const next = params.toString() ? `/rooms?${params.toString()}` : "/rooms";
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
    hydratedFromUrl,
    router,
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
      if (keyword) {
        const haystack = [data.title, data.area, data.address].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
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
  ]);

  const activeFilterCount = useMemo(() => {
    return [area, minRent, maxRent, maxWalk, q.trim()].filter(Boolean).length +
      (genderAllowed !== "Any" ? 1 : 0) +
      (vegOnly ? 1 : 0) +
      (heaterIncluded ? 1 : 0) +
      (attachedBathroom ? 1 : 0);
  }, [area, minRent, maxRent, maxWalk, q, genderAllowed, vegOnly, heaterIncluded, attachedBathroom]);

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
    setSort("new");
    setShowFilterSheet(false);
  };

  const clearFilterDraft = () => {
    setDraftFilters({
      area: "",
      genderAllowed: "Any",
      minRent: "",
      maxRent: "",
      vegOnly: false,
      heaterIncluded: false,
      attachedBathroom: false,
      maxWalk: "",
    });
  };

  const openSortSheet = () => {
    setDraftSort(sort);
    setShowSortSheet(true);
  };

  const openFilterSheet = () => {
    setDraftFilters({
      area,
      genderAllowed,
      minRent,
      maxRent,
      vegOnly,
      heaterIncluded,
      attachedBathroom,
      maxWalk,
    });
    setActiveFilterCategory("locality");
    setShowFilterSheet(true);
  };

  const applyFilterDraft = () => {
    setArea(draftFilters.area);
    setGenderAllowed(draftFilters.genderAllowed);
    setMinRent(draftFilters.minRent);
    setMaxRent(draftFilters.maxRent);
    setVegOnly(draftFilters.vegOnly);
    setHeaterIncluded(draftFilters.heaterIncluded);
    setAttachedBathroom(draftFilters.attachedBathroom);
    setMaxWalk(draftFilters.maxWalk);
    setShowFilterSheet(false);
  };

  const currentSortLabel = sortOptions.find((option) => option.value === sort)?.label || "Newest";

  const renderFilterPanel = () => {
    if (activeFilterCategory === "locality") {
      return (
        <div className="space-y-2">
          <button
            type="button"
            className={[
              "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
              draftFilters.area === ""
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
            ].join(" ")}
            onClick={() => setDraftFilters((current) => ({ ...current, area: "" }))}
          >
            All localities
          </button>
          {DHARAMSHALA_AREAS.map((option) => (
            <button
              key={option}
              type="button"
              className={[
                "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                draftFilters.area === option
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
              ].join(" ")}
              onClick={() => setDraftFilters((current) => ({ ...current, area: option }))}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (activeFilterCategory === "budget") {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {budgetPresets.map((preset) => {
              const active = draftFilters.minRent === preset.min && draftFilters.maxRent === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                    active
                      ? "border-sky-200 bg-sky-50 text-sky-700"
                      : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
                  ].join(" ")}
                  onClick={() =>
                    setDraftFilters((current) => ({
                      ...current,
                      minRent: preset.min,
                      maxRent: preset.max,
                    }))
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="input"
              value={draftFilters.minRent}
              onChange={(e) => setDraftFilters((current) => ({ ...current, minRent: e.target.value }))}
              placeholder="Min price"
              inputMode="numeric"
            />
            <input
              className="input"
              value={draftFilters.maxRent}
              onChange={(e) => setDraftFilters((current) => ({ ...current, maxRent: e.target.value }))}
              placeholder="Max price"
              inputMode="numeric"
            />
          </div>
        </div>
      );
    }

    if (activeFilterCategory === "gender") {
      return (
        <div className="space-y-2">
          {ROOM_GENDER_ALLOWED.map((option) => {
            const active = draftFilters.genderAllowed === option;
            return (
              <button
                key={option}
                type="button"
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                  active
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
                ].join(" ")}
                onClick={() => setDraftFilters((current) => ({ ...current, genderAllowed: option }))}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (activeFilterCategory === "amenities") {
      return (
        <div className="space-y-2">
          <label className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm">
            <span>Attached bathroom</span>
            <input
              type="checkbox"
              checked={draftFilters.attachedBathroom}
              onChange={(e) => setDraftFilters((current) => ({ ...current, attachedBathroom: e.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm">
            <span>Near college walk</span>
            <input
              type="checkbox"
              checked={draftFilters.maxWalk === "15"}
              onChange={(e) =>
                setDraftFilters((current) => ({
                  ...current,
                  maxWalk: e.target.checked ? "15" : "",
                }))
              }
            />
          </label>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm">
          <span>Veg only</span>
          <input
            type="checkbox"
            checked={draftFilters.vegOnly}
            onChange={(e) => setDraftFilters((current) => ({ ...current, vegOnly: e.target.checked }))}
          />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm">
          <span>Heater included</span>
          <input
            type="checkbox"
            checked={draftFilters.heaterIncluded}
            onChange={(e) => setDraftFilters((current) => ({ ...current, heaterIncluded: e.target.checked }))}
          />
        </label>
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-5 pb-28 sm:py-6 sm:pb-6">
      <section className="space-y-4 sm:space-y-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-400 via-sky-300 to-emerald-200 p-5 text-slate-900 shadow-[0_20px_48px_rgba(20,184,166,0.18)] sm:p-6">
          <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/35 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                Dharamshala Student Housing
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Find Rooms Near You</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-700/90">
                Discover verified student stays, compare prices quickly, and browse the best rooms around campus.
              </p>
            </div>
            <Link
              className="btn h-10 border-white/70 bg-white/80 px-4 text-sm text-slate-900 backdrop-blur hover:bg-white"
              href="/post/room"
            >
              Post Room
            </Link>
          </div>

          <div className="relative mt-4 rounded-[1.6rem] border border-white/55 bg-white/45 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="text-sm font-medium text-slate-800">Great ! We picked the best stays for you</div>
            <div className="mt-1 text-xs text-slate-700/75">
              {loading ? "Loading..." : `${filtered.length} rooms live now`} · Sorted by {currentSortLabel}
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <input
            className="h-12 w-full rounded-full border border-[color:color-mix(in srgb, #67e8f9 22%, var(--border) 78%)] bg-[color:var(--card)] pl-11 pr-4 text-sm text-[color:var(--foreground)] shadow-[0_10px_22px_rgba(14,165,233,0.08)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:color-mix(in srgb, #14b8a6 38%, var(--border) 62%)] focus:ring-2 focus:ring-[color:rgba(20,184,166,0.12)]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search area or room"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-full border border-[color:rgba(20,184,166,0.14)] bg-[color:rgba(240,253,250,0.95)] px-4 text-sm font-medium text-slate-700 shadow-[0_6px_14px_rgba(20,184,166,0.08)] transition hover:bg-[color:rgba(236,253,245,1)]"
            onClick={openSortSheet}
          >
            <ArrowUpDown className="mr-2 h-4 w-4 text-teal-600" />
            Sort
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-full border border-[color:rgba(14,165,233,0.14)] bg-[color:rgba(240,249,255,0.95)] px-4 text-sm font-medium text-slate-700 shadow-[0_6px_14px_rgba(14,165,233,0.08)] transition hover:bg-[color:rgba(239,246,255,1)]"
            onClick={openFilterSheet}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4 text-sky-600" />
            Filters
            {activeFilterCount ? (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--foreground)] px-1.5 text-[10px] font-semibold text-[color:var(--background)]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 text-sm text-zinc-600">
          <span>{loading ? "Loading rooms..." : `${filtered.length} room${filtered.length === 1 ? "" : "s"}`}</span>
          <span className="truncate">Sorted by {currentSortLabel}</span>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)}
      </div>

      {!loading && !filtered.length ? (
        <div className="mt-7">
          <div className="card mx-auto max-w-md p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <SearchX className="h-5 w-5" />
            </div>
            <div className="mt-3 text-base font-semibold">No rooms match these filters</div>
            <p className="mt-1 text-sm text-slate-600">Try adjusting filters, changing the area, or posting a listing.</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <button type="button" className="btn h-9 px-4 text-sm" onClick={clearAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset filters
              </button>
              <Link className="btn btn-primary h-9 px-4 text-sm" href="/post/room">
                Post Room
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <BottomSheet open={showSortSheet} title="Sort" onClose={() => setShowSortSheet(false)}>
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className={[
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                draftSort === option.value
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="room-sort"
                  className="h-4 w-4 accent-teal-600"
                  checked={draftSort === option.value}
                  onChange={() => setDraftSort(option.value)}
                />
                <span>{option.label}</span>
              </div>
              {draftSort === option.value ? <Check className="h-4 w-4" /> : null}
            </label>
          ))}
          <div className="sticky bottom-0 flex items-center gap-3 bg-[color:var(--background)] pt-3">
            <button type="button" className="btn flex-1" onClick={() => setDraftSort("new")}>
              Clear All
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                setSort(draftSort);
                setShowSortSheet(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={showFilterSheet} title="Filters" onClose={() => setShowFilterSheet(false)}>
        <div className="space-y-4">
          <div className="grid min-h-[360px] grid-cols-[112px_minmax(0,1fr)] gap-4">
            <div className="space-y-2 rounded-[1.5rem] bg-[color:var(--card-2)] p-2 ring-1 ring-[color:var(--border)]">
              {filterCategories.map((category) => {
                const active = activeFilterCategory === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    className={[
                      "w-full rounded-2xl px-3 py-3 text-left text-sm font-medium transition",
                      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/70",
                    ].join(" ")}
                    onClick={() => setActiveFilterCategory(category.value)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="min-w-0 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--card)] p-3">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                {filterCategories.find((category) => category.value === activeFilterCategory)?.label}
              </div>
              {renderFilterPanel()}
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center gap-3 bg-[color:var(--background)] pt-2">
            <button type="button" className="btn flex-1" onClick={clearFilterDraft}>
              Clear All
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={applyFilterDraft}>
              Apply
            </button>
          </div>
        </div>
      </BottomSheet>
    </main>
  );
}
