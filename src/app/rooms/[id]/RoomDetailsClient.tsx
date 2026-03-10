"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BedDouble, Flame, MapPin, Mountain, Phone, ShieldCheck, Soup, Sun, Utensils, Waves, MessageCircle, Footprints } from "lucide-react";
import { getRoom } from "@/lib/firebase/listings";
import type { RoomListing } from "@/lib/firebase/models";
import { formatINR, institutionShortLabel, toWhatsAppLink } from "@/lib/utils";
import ReportListing from "@/components/listings/ReportListing";
import { useAuth } from "@/components/auth/AuthProvider";
import { PRIMARY_INSTITUTION_SHORT } from "@/lib/constants";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { recordRoomView } from "@/lib/firebase/views";
import SafetyNotice from "@/components/listings/SafetyNotice";
import LocationDisplay from "@/components/ui/LocationDisplay";

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function RoomDetailsClient() {
  const params = useParams<{ id: string; slug?: string }>();
  const id = params.id;
  const { user, profile } = useAuth();
  const [listing, setListing] = useState<RoomListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getRoom(id)
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
    recordRoomView({ roomId: id, viewerId: user.uid }).catch(() => {});
  }, [id, listing, user]);

  const wa = useMemo(() => {
    if (!listing) return null;
    const inst = institutionShortLabel(profile?.institution) || "a student";
    return toWhatsAppLink(
      listing.contactPhone,
      `Hi, I am ${inst} and I am interested in your room on vStudent Dharamshala. Is it still available?`,
    );
  }, [listing, profile?.institution]);

  const phoneHref = useMemo(() => {
    if (!listing) return null;
    return getPhoneHref(listing.contactPhone);
  }, [listing]);

  const shareText = useMemo(() => {
    if (!listing) return null;
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `vStudent Dharamshala: ${listing.title} (${listing.area}) - ${url}`;
  }, [listing]);

  const waShare = useMemo(() => {
    if (!shareText) return null;
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }, [shareText]);

  const facilities = useMemo(() => {
    if (!listing) return [];

    return [
      listing.attachedBathroom ? { label: "Attached bathroom", icon: Waves } : null,
      listing.foodIncluded ? { label: "Food included", icon: Soup } : null,
      listing.vegOnly ? { label: "Veg only", icon: Utensils } : null,
      listing.heaterIncluded ? { label: "Heater included", icon: Flame } : null,
      listing.sunFacing ? { label: "Sun-facing room", icon: Sun } : null,
      listing.mountainView ? { label: "Mountain view", icon: Mountain } : null,
      typeof listing.walkMinutesToHPU === "number"
        ? { label: `${listing.walkMinutesToHPU} min to ${PRIMARY_INSTITUTION_SHORT}`, icon: Footprints }
        : null,
    ].filter(Boolean) as { label: string; icon: typeof Flame }[];
  }, [listing]);

  if (loading) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">Loading...</main>;
  if (error) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 text-red-600">{error}</main>;
  if (!listing) return <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">Not found.</main>;

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <nav className="mb-4 text-sm text-[color:var(--muted)]">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        <span aria-hidden>›</span>{" "}
        <Link href="/rooms" className="hover:underline">
          Rooms
        </Link>{" "}
        <span aria-hidden>›</span> <span className="text-[color:var(--foreground)]">{listing.title}</span>
      </nav>

      <section className="card overflow-hidden">
        <div className="border-b border-[color:var(--border)] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {listing.status === "active" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in srgb, var(--card) 82%, var(--background) 18%)] px-3 py-1 text-xs text-[color:var(--muted)] ring-1 ring-[color:var(--border)]">
                  <BedDouble className="h-3.5 w-3.5" />
                  {listing.genderAllowed}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in srgb, var(--card) 82%, var(--background) 18%)] px-3 py-1 text-xs text-[color:var(--muted)] ring-1 ring-[color:var(--border)]">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.area}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{listing.title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-600">
                {listing.address}
              </p>

              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Rent
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-[color:color-mix(in srgb, var(--brand) 72%, #2563eb 28%)]">
                    {formatINR(listing.rent)}
                    <span className="ml-1 text-base font-medium text-zinc-500">/ month</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Deposit
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{formatINR(listing.deposit)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <FavoriteButton listingType="room" listingId={id} />
              {user?.uid && listing.createdBy === user.uid ? (
                <Link className="btn" href={`/edit/room/${id}`}>
                  Edit listing
                </Link>
              ) : null}
              {waShare ? (
                <a className="btn" href={waShare} target="_blank" rel="noreferrer">
                  Share to {PRIMARY_INSTITUTION_SHORT}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="space-y-6">
            {(listing.photoUrls || []).length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(listing.photoUrls || []).map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className={idx === 0 ? "relative aspect-[16/10] overflow-hidden rounded-3xl bg-zinc-100 sm:col-span-2" : "relative aspect-[16/10] overflow-hidden rounded-3xl bg-zinc-100"}
                  >
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1} of ${listing.title}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 800px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card flex aspect-[16/9] items-center justify-center bg-zinc-50">
                <p className="text-sm text-zinc-500">No photos available</p>
              </div>
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="card p-5">
                <h2 className="text-sm font-semibold">Location</h2>
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                    <span>
                      <span className="font-medium text-[color:var(--foreground)]">{listing.area}</span>
                      <span className="block text-zinc-600">{listing.address}</span>
                    </span>
                  </p>
                  <Link className="btn h-8 px-3 text-xs" href={`/rooms?area=${encodeURIComponent(listing.area)}`}>
                    More rooms in {listing.area}
                  </Link>
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-semibold">Facilities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {facilities.length ? (
                    facilities.map(({ label, icon: Icon }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full bg-[color:color-mix(in srgb, var(--card) 82%, var(--background) 18%)] px-3 py-2 text-xs text-[color:var(--foreground)] ring-1 ring-[color:var(--border)]"
                      >
                        <Icon className="h-3.5 w-3.5 text-zinc-500" />
                        {label}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-600">Basic room details are available above.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {listing.description || "No description provided."}
              </p>
            </section>

            {listing.latitude && listing.longitude ? (
              <section className="card p-5">
                <h2 className="text-sm font-semibold">Map</h2>
                <div className="mt-4">
                  <LocationDisplay latitude={listing.latitude} longitude={listing.longitude} title={listing.title} />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Contact Owner</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Reach out directly by phone or WhatsApp to confirm availability and visit timing.
              </p>
              <div className="mt-4 grid gap-3">
                {phoneHref ? (
                  <a
                    className="btn btn-primary inline-flex h-11 items-center justify-center gap-2"
                    href={phoneHref}
                  >
                    <Phone className="h-4 w-4" />
                    Call Owner
                  </a>
                ) : null}
                {wa ? (
                  <a
                    className="btn inline-flex h-11 items-center justify-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Owner
                  </a>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-zinc-500">{listing.contactPhone}</p>
              <div className="mt-4">
                <SafetyNotice context="room" />
              </div>
            </section>

            <section className="card p-5">
              <h2 className="text-sm font-semibold">Listing Summary</h2>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Monthly rent</span>
                  <span className="font-medium text-[color:var(--foreground)]">{formatINR(listing.rent)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Deposit</span>
                  <span className="font-medium text-[color:var(--foreground)]">{formatINR(listing.deposit)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Area</span>
                  <span className="font-medium text-[color:var(--foreground)]">{listing.area}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Suitable for</span>
                  <span className="font-medium text-[color:var(--foreground)]">{listing.genderAllowed}</span>
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="text-sm font-semibold">Trust</h2>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>{listing.status === "active" ? "Verified listing" : "Listing pending verification"}</span>
                </div>
                {listing.institution ? <div>Listed by {listing.institution}</div> : null}
                {listing.createdByMemberSinceYear ? <div>Member since {listing.createdByMemberSinceYear}</div> : null}
                <Link className="btn mt-2 h-9 px-3 text-xs" href="/rooms">
                  Browse more rooms
                </Link>
              </div>
            </section>

            <ReportListing listingType="room" listingId={id} />
          </aside>
        </div>
      </section>
    </main>
  );
}
