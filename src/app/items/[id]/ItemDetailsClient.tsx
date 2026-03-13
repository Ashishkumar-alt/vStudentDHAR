"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getItem } from "@/lib/firebase/listings";
import type { ItemListing } from "@/lib/firebase/models";
import { formatINR, institutionShortLabel, toWhatsAppLink } from "@/lib/utils";
import ReportListing from "@/components/listings/ReportListing";
import { useAuth } from "@/components/auth/AuthProvider";
import { PRIMARY_INSTITUTION_SHORT } from "@/lib/constants";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { recordItemView } from "@/lib/firebase/views";
import SafetyNotice from "@/components/listings/SafetyNotice";
import PhoneDisplay from "@/components/ui/PhoneDisplay";

export default function ItemDetailsClient() {
  const params = useParams<{ id: string; slug?: string }>();
  const id = params.id;
  const { user, profile } = useAuth();
  const [listing, setListing] = useState<ItemListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getItem(id)
      .then((res) => {
        if (!alive) return;
        setListing(res?.data || null);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load listing");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !listing) return;
    recordItemView({ itemId: id, viewerId: user.uid }).catch(() => {});
  }, [id, listing, user]);

  const wa = useMemo(() => {
    if (!listing) return null;
    const inst = institutionShortLabel(profile?.institution) || "a";
    return toWhatsAppLink(
      listing.contactPhone,
      `Hi, I saw your listing on vStudent Dharamshala. Is it available? (I’m from ${inst})`,
    );
  }, [listing, profile?.institution]);

  const shareText = useMemo(() => {
    if (!listing) return null;
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `vStudent Dharamshala: ${listing.title} (${listing.category}) - ${url}`;
  }, [listing]);

  const waShare = useMemo(() => {
    if (!shareText) return null;
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }, [shareText]);

  if (loading) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">Loading…</main>;
  if (error) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 text-red-600">{error}</main>;
  if (!listing) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">Not found.</main>;

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <nav className="mb-4 text-sm text-[color:var(--muted)]">
        <Link href="/items" className="hover:underline">
          Items
        </Link>{" "}
        <span aria-hidden>›</span> <span className="text-[color:var(--foreground)]">{listing.title}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {listing.category} - {listing.area} - {listing.condition}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Link className="btn h-8 px-3 text-xs" href="/items">
              More student items in Dharamshala
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <FavoriteButton listingType="item" listingId={id} />
          {user?.uid && listing.createdBy === user.uid ? (
            <Link className="btn" href={`/edit/item/${id}`}>
              Edit
            </Link>
          ) : null}
          {waShare ? (
            <a className="btn" href={waShare} target="_blank" rel="noreferrer">
              Share to {PRIMARY_INSTITUTION_SHORT} WhatsApp group
            </a>
          ) : null}
          {wa ? (
            <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">
              WhatsApp seller
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {(listing.photoUrls || []).length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {(listing.photoUrls || []).map((url, idx) => (
                <div key={url} className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                  <Image
                    src={url}
                    alt={`Photo ${idx + 1} of ${listing.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex aspect-[16/8] items-center justify-center bg-zinc-50">
              <p className="text-sm text-zinc-500">No photos</p>
            </div>
          )}

          <section className="card mt-4 p-5">
            <h2 className="text-sm font-semibold">Details</h2>
            <div className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              <div>Price: {formatINR(listing.price)}</div>
              <div>Condition: {listing.condition}</div>
              <div className="sm:col-span-2">Area: {listing.area}</div>
            </div>
            {listing.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">{listing.description}</p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-semibold">Trust</h2>
            <div className="mt-2 space-y-1 text-sm text-zinc-700">
              <div>Verified account ✔</div>
              {listing.institution ? <div>Listed by {listing.institution} student</div> : null}
              {listing.createdByMemberSinceYear ? <div>Member since {listing.createdByMemberSinceYear}</div> : null}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="text-sm font-semibold">Contact</h2>
            <div className="mt-2">
              <PhoneDisplay 
                phone={listing.contactPhone}
                className="text-sm text-zinc-600"
                showRevealButton={true}
              />
            </div>
            <div className="mt-3">
              <SafetyNotice context="item" />
            </div>
          </section>
          {wa ? (
            <a className="btn btn-primary mt-3 w-full" href={wa} target="_blank" rel="noreferrer">
              Open WhatsApp
            </a>
          ) : null}
          <ReportListing listingType="item" listingId={id} />
        </aside>
      </div>
    </main>
  );
}

