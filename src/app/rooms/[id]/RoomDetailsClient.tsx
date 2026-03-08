"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
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

  const handleContactOwner = () => {
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    
    if (!listing) return;
    
    // Open WhatsApp chat with the specified format
    const whatsappUrl = `https://wa.me/${listing.contactPhone}?text=Hi I saw your room on vStudent and I'm interested.`;
    window.open(whatsappUrl, '_blank');
  };

  const wa = useMemo(() => {
    if (!listing) return null;
    const inst = institutionShortLabel(profile?.institution) || "a";
    return toWhatsAppLink(
      listing.contactPhone,
      `Hi, I’m a student from ${inst}. Is this room still available? (vStudent Dharamshala)`,
    );
  }, [listing, profile?.institution]);

  const shareText = useMemo(() => {
    if (!listing) return null;
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `vStudent Dharamshala: ${listing.title} (${listing.area}) - ${url}`;
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
        <Link href="/rooms" className="hover:underline">
          Rooms
        </Link>{" "}
        <span aria-hidden>›</span> <span className="text-[color:var(--foreground)]">{listing.title}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {listing.area} - {listing.genderAllowed}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Link className="btn h-8 px-3 text-xs" href={`/rooms?area=${encodeURIComponent(listing.area)}`}>
              More rooms in {listing.area}
            </Link>
            <Link className="btn h-8 px-3 text-xs" href="/rooms">
              All rooms in Dharamshala
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <FavoriteButton listingType="room" listingId={id} />
          {user?.uid && listing.createdBy === user.uid ? (
            <Link className="btn" href={`/edit/room/${id}`}>
              Edit
            </Link>
          ) : null}
          {waShare ? (
            <a className="btn" href={waShare} target="_blank" rel="noreferrer">
              Share to {PRIMARY_INSTITUTION_SHORT} WhatsApp group
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
              <div>Rent: {formatINR(listing.rent)}/month</div>
              <div>Deposit: {formatINR(listing.deposit)}</div>
              <div>Food included: {listing.foodIncluded ? "Yes" : "No"}</div>
              <div>Attached bathroom: {listing.attachedBathroom ? "Yes" : "No"}</div>
              <div>Veg only: {listing.vegOnly ? "Yes" : "No"}</div>
              <div>Heater included: {listing.heaterIncluded ? "Yes" : "No"}</div>
              {typeof listing.walkMinutesToHPU === "number" ? (
                <div>
                  Walking distance to {PRIMARY_INSTITUTION_SHORT}: {listing.walkMinutesToHPU} min
                </div>
              ) : null}
              <div className="sm:col-span-2">Address: {listing.address}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {listing.heaterIncluded ? (
                <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">Winter Ready</span>
              ) : null}
              {listing.sunFacing ? (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Sun-facing</span>
              ) : null}
              {listing.mountainView ? (
                <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800">Mountain view</span>
              ) : null}
            </div>
            {listing.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">{listing.description}</p>
            ) : null}
          </section>

          {/* Room Location Map */}
          {listing.latitude && listing.longitude && (
            <section className="card mt-4 p-5">
              <h2 className="text-sm font-semibold mb-4">Room Location</h2>
              <LocationDisplay
                latitude={listing.latitude}
                longitude={listing.longitude}
                title={listing.title}
              />
              <div className="mt-3 text-xs text-zinc-600">
                <p>Address: {listing.address}</p>
                <p className="mt-1">Area: {listing.area}</p>
              </div>
            </section>
          )}
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
            <div className="mt-3">
              <SafetyNotice context="room" />
            </div>
            <button 
              onClick={handleContactOwner}
              className="btn btn-primary mt-3 w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat with Owner on WhatsApp
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Login required to contact owner.
            </p>
          </section>

          <ReportListing listingType="room" listingId={id} />
        </aside>
      </div>
    </main>
  );
}

