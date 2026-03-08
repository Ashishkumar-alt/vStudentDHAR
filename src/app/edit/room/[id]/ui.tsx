"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import RequireProfile from "@/components/auth/RequireProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import PhotoPicker from "@/components/post/PhotoPicker";
import LocationPicker from "@/components/ui/LocationPicker";
import { getRoom, updateRoom } from "@/lib/firebase/listings";
import type { RoomListing } from "@/lib/firebase/models";
import { DHARAMSHALA_AREAS, PRIMARY_INSTITUTION_SHORT, ROOM_GENDER_ALLOWED } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  rent: z.string().min(1).refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, "Enter valid rent"),
  deposit: z.string().min(1).refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, "Enter valid deposit"),
  area: z.string().min(2),
  address: z.string().min(5),
  genderAllowed: z.enum(["Any", "Boys", "Girls"]),
  vegOnly: z.boolean(),
  attachedBathroom: z.boolean(),
  foodIncluded: z.boolean(),
  heaterIncluded: z.boolean(),
  walkMinutesToHPU: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => v == null || v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 120),
      "0-120",
    ),
  sunFacing: z.boolean(),
  mountainView: z.boolean(),
  description: z.string().max(1200).optional().or(z.literal("")),
  contactPhone: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function EditRoomClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [listing, setListing] = useState<RoomListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLatitude, setSelectedLatitude] = useState<number | undefined>();
  const [selectedLongitude, setSelectedLongitude] = useState<number | undefined>();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getRoom(id)
      .then((res) => {
        if (!alive) return;
        setListing(res?.data || null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // Initialize coordinates when listing loads
  useEffect(() => {
    if (listing) {
      setSelectedLatitude(listing.latitude);
      setSelectedLongitude(listing.longitude);
    }
  }, [listing]);

  const defaults = useMemo<FormValues>(
    () => ({
      title: listing?.title || "",
      rent: listing ? String(listing.rent) : "",
      deposit: listing ? String(listing.deposit) : "",
      area: listing?.area || DHARAMSHALA_AREAS[0],
      address: listing?.address || "",
      genderAllowed: listing?.genderAllowed || "Any",
      vegOnly: Boolean(listing?.vegOnly),
      attachedBathroom: Boolean(listing?.attachedBathroom),
      foodIncluded: Boolean(listing?.foodIncluded),
      heaterIncluded: Boolean(listing?.heaterIncluded),
      walkMinutesToHPU: typeof listing?.walkMinutesToHPU === "number" ? String(listing.walkMinutesToHPU) : "",
      sunFacing: Boolean(listing?.sunFacing),
      mountainView: Boolean(listing?.mountainView),
      description: listing?.description || "",
      contactPhone: listing?.contactPhone || profile?.whatsappNumber || "",
    }),
    [listing, profile?.whatsappNumber],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  async function onSubmit(values: FormValues) {
    if (!user) return;
    if (!listing) return;
    if (listing.createdBy !== user.uid) {
      setError("Not authorized to edit this listing.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (photos.length > 5) throw new Error("Max 5 photos.");
      await updateRoom(
        id,
        {
          title: values.title.trim(),
          rent: Number(values.rent),
          deposit: Number(values.deposit),
          area: values.area.trim(),
          address: values.address.trim(),
          latitude: selectedLatitude,
          longitude: selectedLongitude,
          genderAllowed: values.genderAllowed,
          vegOnly: values.vegOnly,
          attachedBathroom: values.attachedBathroom,
          foodIncluded: values.foodIncluded,
          heaterIncluded: values.heaterIncluded,
          walkMinutesToHPU: values.walkMinutesToHPU ? Number(values.walkMinutesToHPU) : undefined,
          sunFacing: values.sunFacing,
          mountainView: values.mountainView,
          description: values.description?.trim() || "",
          contactPhone: values.contactPhone.trim(),
        },
        photos.length ? { newPhotos: photos, replacePhotos: true } : undefined,
      );
      router.replace(`/rooms/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireProfile>
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Edit room</h1>
            <p className="mt-1 text-sm text-zinc-600">Update your room listing.</p>
          </div>
          <button className="btn" type="button" onClick={() => router.back()}>
            Back
          </button>
        </div>

        {loading ? <div className="mt-6 text-sm text-zinc-600">Loading...</div> : null}
        {!loading && !listing ? <div className="mt-6 text-sm text-zinc-600">Not found.</div> : null}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {listing ? (
          <>
            {(listing.photoUrls || []).length ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Current photos</div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {listing.photoUrls.slice(0, 8).map((url, idx) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                      <Image src={url} alt={`Photo ${idx + 1} of ${listing.title}`} fill sizes="200px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  To replace photos, pick new ones below (max 5). Old photos will stay in Cloudinary but won’t show in the
                  listing.
                </p>
              </div>
            ) : null}

            <form className="card mt-6 p-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <input className="input mt-2" {...form.register("title")} />
                  {form.formState.errors.title ? (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.title.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">Rent (₹/month)</label>
                  <input className="input mt-2" inputMode="numeric" {...form.register("rent")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Deposit (₹)</label>
                  <input className="input mt-2" inputMode="numeric" {...form.register("deposit")} />
                </div>

                <div>
                  <label className="text-sm font-medium">Area</label>
                  <select className="select mt-2" {...form.register("area")}>
                    {DHARAMSHALA_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Gender allowed</label>
                  <select className="select mt-2" {...form.register("genderAllowed")}>
                    {ROOM_GENDER_ALLOWED.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <input className="input mt-2" {...form.register("address")} />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Room Location (Click on map to update exact location)</label>
                  <div className="mt-2">
                    <LocationPicker
                      latitude={selectedLatitude}
                      longitude={selectedLongitude}
                      onLocationChange={(lat, lng) => {
                        setSelectedLatitude(lat);
                        setSelectedLongitude(lng);
                      }}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" {...form.register("vegOnly")} />
                  Veg only
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" {...form.register("attachedBathroom")} />
                  Attached bathroom
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" {...form.register("foodIncluded")} />
                  Food included
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" {...form.register("heaterIncluded")} />
                  Heater included (Winter ready)
                </label>

                <div>
                  <label className="text-sm font-medium">
                    Walking distance to {PRIMARY_INSTITUTION_SHORT} (minutes)
                  </label>
                  <input
                    className="input mt-2"
                    inputMode="numeric"
                    placeholder="e.g. 8"
                    {...form.register("walkMinutesToHPU")}
                  />
                  {form.formState.errors.walkMinutesToHPU ? (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.walkMinutesToHPU.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" {...form.register("sunFacing")} />
                    Sun-facing room
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" {...form.register("mountainView")} />
                    Mountain view
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea className="textarea mt-2" rows={4} {...form.register("description")} />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">WhatsApp number</label>
                  <input className="input mt-2" placeholder="+91XXXXXXXXXX" {...form.register("contactPhone")} />
                </div>

                <div className="sm:col-span-2">
                  <PhotoPicker max={5} value={photos} onChange={setPhotos} />
                  <p className="mt-2 text-xs text-zinc-500">Leave empty to keep existing photos.</p>
                </div>
              </div>

              <button className="btn btn-primary mt-5 w-full" disabled={busy}>
                {busy ? "Saving..." : "Save changes"}
              </button>
            </form>
          </>
        ) : null}
      </main>
    </RequireProfile>
  );
}

