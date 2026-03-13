"use client";

import Image from "next/image";
import Link from "next/link";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { formatINR, toWhatsAppLink } from "@/lib/utils";
import { MapPin, MessageCircle, Footprints, Flame, Leaf, Phone } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import VerificationBadges from "@/components/ui/VerificationBadges";
import TrustSignals from "@/components/ui/TrustSignals";
import { itemSlug } from "@/lib/seo/slug";
import PhoneDisplay from "@/components/ui/PhoneDisplay";

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

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Room Image */}
      <Link
        href={detailsHref}
        aria-label={`View room details for ${listing.title}`}
        className="block aspect-[16/10] w-full bg-gray-100"
      >
        <div className="relative h-full">
          <div className="absolute right-3 top-3 z-20">
            <FavoriteButton listingType="room" listingId={id} />
          </div>

          {/* Verified Badge - Top Left */}
          {listing.status === "active" ? (
            <div className="absolute left-3 top-3 z-20">
              <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                Verified
              </span>
            </div>
          ) : null}

          {/* Room Image */}
          {listing.photoUrls?.[0] ? (
            <Image
              src={listing.photoUrls[0]}
              alt={listing.title || "Room listing"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center bg-gray-100';
                  placeholder.innerHTML = '<div class="text-center"><div class="text-4xl mb-2">🏠</div><div class="text-sm">No Image</div></div>';
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🏠</div>
                <div className="text-sm text-gray-500">No Image</div>
              </div>
            </div>
          )}

          {/* Price Overlay - Bottom Right of Image */}
          <div className="absolute right-3 bottom-3 z-20">
            <div className="rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
              <div className="text-lg font-bold text-gray-900">{formatINR(listing.rent)}</div>
              <div className="text-xs text-gray-600">per month</div>
            </div>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 truncate">{listing.title}</h3>
          <div className="mt-1 flex items-center text-sm text-gray-600">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{listing.area}</span>
          </div>
        </div>

        {/* Availability Status */}
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            Available Now
          </span>
        </div>

        {/* View Details Button */}
        <Link
          href={detailsHref}
          className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details
        </Link>
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
            alt={listing.title || "Item listing"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400';
                placeholder.innerHTML = '<div class="text-center"><div class="text-4xl mb-2">📦</div><div class="text-sm">No Image</div></div>';
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
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
