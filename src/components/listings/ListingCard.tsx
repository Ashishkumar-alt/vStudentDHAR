"use client";

import Image from "next/image";
import Link from "next/link";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { formatINR, toWhatsAppLink } from "@/lib/utils";
import { MapPin, MessageCircle, Footprints, Flame, Leaf } from "lucide-react";

function isNew(createdAt: unknown) {
  try {
    const created = (createdAt as { toDate?: () => Date } | null)?.toDate?.();
    if (!created) return false;
    const diff = Date.now() - created.getTime();
    return diff < 1000 * 60 * 60 * 24 * 3; // 3 days
  } catch {
    return false;
  }
}

export function RoomCard({ id, listing }: { id: string; listing: RoomListing }) {
  const wa = toWhatsAppLink(
    listing.contactPhone,
    `Hi, I’m interested in your room on vStudent Dharamshala: ${listing.title}. Is it available?`,
  );
  return (
    <div className="card card-hover group overflow-hidden">
      <Link href={`/rooms/${id}`} className="relative block aspect-[16/10] w-full bg-zinc-100">
        {listing.photoUrls?.[0] ? (
          <Image
            src={listing.photoUrls[0]}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isNew(listing.createdAt) ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
              New
            </span>
          ) : null}
          {listing.heaterIncluded ? (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white">
              Winter Ready
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/rooms/${id}`} className="block truncate text-sm font-semibold hover:underline">
              {listing.title}
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {listing.area} · {listing.genderAllowed}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-xs text-zinc-500">Deposit {formatINR(listing.deposit)}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
          {listing.foodIncluded ? <span className="rounded-full bg-zinc-100 px-2 py-1">Food</span> : null}
          {listing.attachedBathroom ? <span className="rounded-full bg-zinc-100 px-2 py-1">Attached bath</span> : null}
          {listing.vegOnly ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1">
              <Leaf className="h-3.5 w-3.5" />
              Veg
            </span>
          ) : null}
          {listing.heaterIncluded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <Flame className="h-3.5 w-3.5" />
              Heater
            </span>
          ) : null}
          {typeof listing.walkMinutesToHPU === "number" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1">
              <Footprints className="h-3.5 w-3.5" />
              {listing.walkMinutesToHPU} min
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-blue-600">{formatINR(listing.rent)}/month</div>
          <div className="flex items-center gap-2">
            <Link
              href={`/rooms/${id}`}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              View Details
            </Link>
            <a
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              href={wa}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItemCard({ id, listing }: { id: string; listing: ItemListing }) {
  const wa = toWhatsAppLink(
    listing.contactPhone,
    `Hi, I saw your listing on vStudent Dharamshala: ${listing.title}. Is it available?`,
  );
  return (
    <div className="card card-hover group overflow-hidden">
      <Link href={`/items/${id}`} className="relative block aspect-[16/10] w-full bg-zinc-100">
        {listing.photoUrls?.[0] ? (
          <Image
            src={listing.photoUrls[0]}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isNew(listing.createdAt) ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
              New
            </span>
          ) : null}
          {listing.category === "Room Heater" ? (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white">
              Winter Hot
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/items/${id}`} className="block truncate text-sm font-semibold hover:underline">
              {listing.title}
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {listing.category} · {listing.area}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-xs text-zinc-500">{listing.condition}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
          <span className="rounded-full bg-zinc-100 px-2 py-1">{listing.condition}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-emerald-600">{formatINR(listing.price)}</div>
          <div className="flex items-center gap-2">
            <Link
              href={`/items/${id}`}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              View Details
            </Link>
            <a
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              href={wa}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
