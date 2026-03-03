"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/auth/AuthProvider";
import PhotoPicker from "./PhotoPicker";
import { createItem } from "@/lib/firebase/listings";
import { DEFAULT_CITY_ID, DHARAMSHALA_AREAS, ITEM_CATEGORIES, ITEM_CONDITION, REQUIRE_APPROVAL } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(4),
  category: z.string().min(2),
  price: z
    .string()
    .min(1)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, "Enter valid price"),
  condition: z.string().min(2),
  area: z.string().min(2),
  description: z.string().max(1200).optional().or(z.literal("")),
  contactPhone: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function ItemPostForm() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo<FormValues>(
    () => ({
      title: "",
      category: ITEM_CATEGORIES[0],
      price: "",
      condition: ITEM_CONDITION[2],
      area: DHARAMSHALA_AREAS[0],
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
      if (photos.length > 4) throw new Error("Max 4 photos.");

      const id = await createItem(
        {
          type: "item",
          cityId: DEFAULT_CITY_ID,
          institution: profile?.institution,
          createdByMemberSinceYear: profile?.createdAt?.toDate?.()?.getFullYear?.(),
          title: values.title.trim(),
          category: values.category,
          price: Number(values.price),
          condition: values.condition,
          area: values.area.trim(),
          description: values.description?.trim() || "",
          photoUrls: [],
          contactPhone: values.contactPhone.trim(),
          status: "active",
          approved: !REQUIRE_APPROVAL,
          createdBy: user.uid,
        },
        photos.slice(0, 4),
      );

      router.replace(`/items/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post item");
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
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select className="select mt-2" {...form.register("category")}>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Condition</label>
          <select className="select mt-2" {...form.register("condition")}>
            {ITEM_CONDITION.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Price (₹)</label>
          <input
            className="input mt-2"
            inputMode="numeric"
            {...form.register("price")}
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
          <PhotoPicker max={4} value={photos} onChange={setPhotos} />
        </div>
      </div>

      {REQUIRE_APPROVAL ? (
        <p className="mt-4 text-xs text-zinc-500">
          Note: Listings go live after admin approval (config: `NEXT_PUBLIC_REQUIRE_APPROVAL=1`).
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button className="btn btn-primary mt-5 w-full" disabled={busy}>
        {busy ? "Posting…" : "Post item"}
      </button>
    </form>
  );
}
