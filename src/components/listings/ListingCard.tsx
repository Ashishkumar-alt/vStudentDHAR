"use client";

import Image from "next/image";
import Link from "next/link";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { formatINR, toWhatsAppLink } from "@/lib/utils";
import { MapPin, MessageCircle, Footprints, Flame, Leaf } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { itemSlug } from "@/lib/seo/slug";

function isNew(createdAt: unknown) {
  try {
    const created = (createdAt as { toDate?: () => Date } | null)?.toDate?.();
    if (!created) return false;
    const diff = Date.now() - created.getTime();
    return diff < 1000 * 60 * 60 * 24 * 3;
  } catch {
    return false;
  }
}

export function RoomCard({ id, listing }: { id: string; listing: RoomListing }) {
  const detailsHref = `/rooms/${id}`;
  const wa = toWhatsAppLink(
    listing.contactPhone,
    `Hi, I am interested in your room on vStudent Dharamshala: ${listing.title}. Is it available?`,
  );

  return (
    <article className="card card-hover group relative overflow-hidden">
      <Link
        href={detailsHref}
        aria-label={`View room details for ${listing.title}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative aspect-[16/10] w-full bg-[color:color-mix(in srgb, var(--card) 70%, var(--background) 30%)]">
        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton listingType="room" listingId={id} />
        </div>

        {listing.photoUrls?.[0] ? (
          <Image
            src={listing.photoUrls[0]}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {listing.status === "active" ? (
            <span className="rounded-full bg-blue-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              Verified
            </span>
          ) : null}
          {isNew(listing.createdAt) ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              New
            </span>
          ) : null}
          {listing.heaterIncluded ? (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              Winter Ready
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3 z-20">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold tracking-tight text-white">{listing.title}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-white/85">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {listing.area} · {listing.genderAllowed}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl bg-white/12 px-3 py-2 text-right backdrop-blur">
              <div className="text-[11px] font-medium text-white/80">Rent</div>
              <div className="text-sm font-semibold text-white">{formatINR(listing.rent)}/mo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-[color:var(--muted)]">Deposit {formatINR(listing.deposit)}</div>
          <div className="inline-flex items-center gap-2 text-xs text-[color:var(--muted)]">
            {listing.foodIncluded ? (
              <span className="rounded-full bg-[color:color-mix(in srgb, var(--card) 80%, var(--background) 20%)] px-2 py-1 ring-1 ring-[color:var(--border)]">
                Food
              </span>
            ) : null}
            {listing.attachedBathroom ? (
              <span className="rounded-full bg-[color:color-mix(in srgb, var(--card) 80%, var(--background) 20%)] px-2 py-1 ring-1 ring-[color:var(--border)]">
                Attached bath
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
          {listing.vegOnly ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in srgb, var(--card) 80%, var(--background) 20%)] px-2 py-1 ring-1 ring-[color:var(--border)]">
              <Leaf className="h-3.5 w-3.5" />
              Veg
            </span>
          ) : null}
          {listing.heaterIncluded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in srgb, var(--accent) 14%, transparent)] px-2 py-1 text-[color:color-mix(in srgb, var(--accent) 60%, var(--foreground) 40%)] ring-1 ring-[color:color-mix(in srgb, var(--accent) 30%, var(--border) 70%)]">
              <Flame className="h-3.5 w-3.5" />
              Heater
            </span>
          ) : null}
          {typeof listing.walkMinutesToHPU === "number" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in srgb, var(--card) 80%, var(--background) 20%)] px-2 py-1 ring-1 ring-[color:var(--border)]">
              <Footprints className="h-3.5 w-3.5" />
              {listing.walkMinutesToHPU} min walk
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-[color:color-mix(in srgb, var(--brand) 70%, #2563eb 30%)]">
            {formatINR(listing.rent)}/month
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={detailsHref}
              className="focus-ring inline-flex h-9 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:shadow-md hover:brightness-[1.02] active:translate-y-px"
            >
              View Details
            </Link>
            <a
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow-sm transition hover:shadow-md active:translate-y-px"
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
    </article>
  );
}

export function ItemCard({ id, listing }: { id: string; listing: ItemListing }) {
  const slug = itemSlug({
    title: listing.title,
    category: listing.category,
    area: listing.area,
    price: listing.price,
  });
  const wa = toWhatsAppLink(
    listing.contactPhone,
    `Hi, I saw your listing on vStudent Dharamshala: ${listing.title}. Is it available?`,
  );
  return (
    <div className="card card-hover group overflow-hidden">
      <Link
        href={`/items/${id}/${slug}`}
        className="relative block aspect-[16/10] w-full bg-[color:color-mix(in srgb, var(--card) 70%, var(--background) 30%)]"
      >
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton listingType="item" listingId={id} />
        </div>
        {listing.photoUrls?.[0] ? (
          <Image
            src={listing.photoUrls[0]}
            alt={listing.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {listing.status === "active" ? (
            <span className="rounded-full bg-blue-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              Verified
            </span>
          ) : null}
          {isNew(listing.createdAt) ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              New
            </span>
          ) : null}
          {listing.category === "Room Heater" ? (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
              Winter Hot
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-white">{listing.title}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {listing.category} · {listing.area}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-right backdrop-blur">
              <div className="text-[11px] font-medium text-white/80">Price</div>
              <div className="text-sm font-semibold text-white">{formatINR(listing.price)}</div>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 text-xs text-[color:var(--muted)]">
            Condition{" "}
            <span className="font-medium text-[color:var(--foreground)]">{listing.condition}</span>
          </div>
          <span className="rounded-full bg-[color:color-mix(in srgb, var(--card) 80%, var(--background) 20%)] px-2 py-1 text-xs text-[color:var(--muted)] ring-1 ring-[color:var(--border)]">
            {listing.condition}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-[color:color-mix(in srgb, var(--accent) 70%, var(--foreground) 30%)]">
            {formatINR(listing.price)}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/items/${id}/${slug}`}
              className="focus-ring inline-flex h-9 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-medium text-white shadow-sm transition hover:shadow-md hover:brightness-[1.02] active:translate-y-px"
            >
              View details
            </Link>
            <a
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow-sm transition hover:shadow-md active:translate-y-px"
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
