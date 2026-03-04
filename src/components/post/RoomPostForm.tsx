"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/auth/AuthProvider";
import PhotoPicker from "./PhotoPicker";
import { createRoom } from "@/lib/firebase/listings";
import { DEFAULT_CITY_ID, DHARAMSHALA_AREAS, PRIMARY_INSTITUTION_SHORT, REQUIRE_APPROVAL, ROOM_GENDER_ALLOWED } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  rent: z
    .string()
    .min(1)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, "Enter valid rent"),
  deposit: z
    .string()
    .min(1)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, "Enter valid deposit"),
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

export default function RoomPostForm() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo<FormValues>(
    () => ({
      title: "",
      rent: "",
      deposit: "",
      area: DHARAMSHALA_AREAS[0],
      address: "",
      genderAllowed: "Any",
      vegOnly: false,
      attachedBathroom: false,
      foodIncluded: false,
      heaterIncluded: false,
      walkMinutesToHPU: "",
      sunFacing: false,
      mountainView: false,
      description: "",
      contactPhone: profile?.whatsappNumber || "",
    }),
    [profile?.whatsappNumber],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!profile?.whatsappNumber) return;
    const current = form.getValues("contactPhone");
    if (!current) form.setValue("contactPhone", profile.whatsappNumber, { shouldDirty: true });
  }, [profile?.whatsappNumber, form]);

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      if (photos.length === 0) throw new Error("Add at least 1 photo.");
      if (photos.length > 5) throw new Error("Max 5 photos.");

      const id = await createRoom(
        {
          type: "room",
          cityId: DEFAULT_CITY_ID,
          institution: profile?.institution,
          createdByMemberSinceYear: profile?.createdAt?.toDate?.()?.getFullYear?.(),
          title: values.title.trim(),
          rent: Number(values.rent),
          deposit: Number(values.deposit),
          area: values.area.trim(),
          address: values.address.trim(),
          genderAllowed: values.genderAllowed,
          vegOnly: values.vegOnly,
          attachedBathroom: values.attachedBathroom,
          foodIncluded: values.foodIncluded,
          heaterIncluded: values.heaterIncluded,
          walkMinutesToHPU: values.walkMinutesToHPU ? Number(values.walkMinutesToHPU) : undefined,
          sunFacing: values.sunFacing,
          mountainView: values.mountainView,
          description: values.description?.trim() || "",
          photoUrls: [],
          contactPhone: values.contactPhone.trim(),
          status: "active",
          approved: !REQUIRE_APPROVAL,
          createdBy: user.uid,
        },
        photos,
      );

      router.replace(`/rooms/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post room");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="card mt-6 p-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
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
          <input
            className="input mt-2"
            inputMode="numeric"
            {...form.register("rent")}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Deposit (₹)</label>
          <input
            className="input mt-2"
            inputMode="numeric"
            {...form.register("deposit")}
          />
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
          <label className="text-sm font-medium">Walking distance to {PRIMARY_INSTITUTION_SHORT} (minutes)</label>
          <input className="input mt-2" inputMode="numeric" placeholder="e.g. 8" {...form.register("walkMinutesToHPU")} />
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
          <textarea
            className="textarea mt-2"
            rows={4}
            {...form.register("description")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">WhatsApp number</label>
          <input
            className="input mt-2"
            placeholder="+91XXXXXXXXXX"
            {...form.register("contactPhone")}
          />
        </div>

        <div className="sm:col-span-2">
          <PhotoPicker max={5} value={photos} onChange={setPhotos} />
        </div>
      </div>

      {REQUIRE_APPROVAL ? (
        <p className="mt-4 text-xs text-zinc-500">
          Note: Listings go live after admin approval (config: `NEXT_PUBLIC_REQUIRE_APPROVAL=1`).
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button className="btn btn-primary mt-5 w-full" disabled={busy}>
        {busy ? "Posting…" : "Post room"}
      </button>
    </form>
  );
}
