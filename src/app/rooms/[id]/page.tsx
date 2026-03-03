"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getRoom } from "@/lib/firebase/listings";
import type { RoomListing } from "@/lib/firebase/models";
import { formatINR, toWhatsAppLink } from "@/lib/utils";
import ReportListing from "@/components/listings/ReportListing";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { profile } = useAuth();
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

  const wa = useMemo(() => {
    if (!listing) return null;
    const inst = profile?.institution?.includes("HPU") ? "HPU" : profile?.institution || "a";
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

  if (loading) return <main className="mx-auto w-full max-w-5xl px-4 py-8">Loading…</main>;
  if (error) return <main className="mx-auto w-full max-w-5xl px-4 py-8 text-red-600">{error}</main>;
  if (!listing) return <main className="mx-auto w-full max-w-5xl px-4 py-8">Not found.</main>;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {listing.area} - {listing.genderAllowed}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {waShare ? (
            <a className="btn" href={waShare} target="_blank" rel="noreferrer">
              Share to HPU WhatsApp group
            </a>
          ) : null}
          {wa ? (
            <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">
              WhatsApp owner
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
                  <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex aspect-[16/8] items-center justify-center bg-zinc-50">
              <p className="text-sm text-zinc-500">No photos</p>
            </div>
          )}

          <div className="card mt-4 p-5">
            <div className="text-sm font-semibold">Details</div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              <div>Rent: {formatINR(listing.rent)}/month</div>
              <div>Deposit: {formatINR(listing.deposit)}</div>
              <div>Food included: {listing.foodIncluded ? "Yes" : "No"}</div>
              <div>Attached bathroom: {listing.attachedBathroom ? "Yes" : "No"}</div>
              <div>Veg only: {listing.vegOnly ? "Yes" : "No"}</div>
              <div>Heater included: {listing.heaterIncluded ? "Yes" : "No"}</div>
              {typeof listing.walkMinutesToHPU === "number" ? (
                <div>Walking distance to HPU: {listing.walkMinutesToHPU} min</div>
              ) : null}
              <div className="sm:col-span-2">Address: {listing.address}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {listing.heaterIncluded ? <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">Winter Ready</span> : null}
              {listing.sunFacing ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Sun-facing</span> : null}
              {listing.mountainView ? <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800">Mountain view</span> : null}
            </div>
            {listing.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">{listing.description}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold">Trust</div>
            <div className="mt-2 space-y-1 text-sm text-zinc-700">
              <div>Verified account ✔</div>
              {listing.institution ? <div>Listed by {listing.institution} student</div> : null}
              {listing.createdByMemberSinceYear ? <div>Member since {listing.createdByMemberSinceYear}</div> : null}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm font-semibold">Contact</div>
            <p className="mt-2 text-sm text-zinc-600">WhatsApp: {listing.contactPhone}</p>
            {wa ? (
              <a className="btn btn-primary mt-3 w-full" href={wa} target="_blank" rel="noreferrer">
                Open WhatsApp
              </a>
            ) : null}
          </div>

          <ReportListing listingType="room" listingId={id} />
        </div>
      </div>
    </main>
  );
}
