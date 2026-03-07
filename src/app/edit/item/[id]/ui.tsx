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
import { getItem, updateItem } from "@/lib/firebase/listings";
import type { ItemListing } from "@/lib/firebase/models";
import { DHARAMSHALA_AREAS, ITEM_CATEGORIES, ITEM_CONDITION } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(4),
  category: z.string().min(2),
  price: z.string().min(1).refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, "Enter valid price"),
  condition: z.string().min(2),
  area: z.string().min(2),
  description: z.string().max(1200).optional().or(z.literal("")),
  contactPhone: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function EditItemClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [listing, setListing] = useState<ItemListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getItem(id)
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

  const defaults = useMemo<FormValues>(
    () => ({
      title: listing?.title || "",
      category: listing?.category || ITEM_CATEGORIES[0],
      price: listing ? String(listing.price) : "",
      condition: listing?.condition || ITEM_CONDITION[2],
      area: listing?.area || DHARAMSHALA_AREAS[0],
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
      if (photos.length > 4) throw new Error("Max 4 photos.");
      await updateItem(
        id,
        {
          title: values.title.trim(),
          category: values.category,
          price: Number(values.price),
          condition: values.condition,
          area: values.area.trim(),
          description: values.description?.trim() || "",
          contactPhone: values.contactPhone.trim(),
        },
        photos.length ? { newPhotos: photos.slice(0, 4), replacePhotos: true } : undefined,
      );
      router.replace(`/items/${id}`);
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
            <h1 className="text-2xl font-semibold">Edit item</h1>
            <p className="mt-1 text-sm text-zinc-600">Update your item listing.</p>
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
                <p className="mt-3 text-xs text-zinc-500">To replace photos, pick new ones below (max 4).</p>
              </div>
            ) : null}

            <form className="card mt-6 p-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                  <input className="input mt-2" inputMode="numeric" {...form.register("price")} />
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
                  <textarea className="textarea mt-2" rows={4} {...form.register("description")} />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">WhatsApp number</label>
                  <input className="input mt-2" placeholder="+91XXXXXXXXXX" {...form.register("contactPhone")} />
                </div>

                <div className="sm:col-span-2">
                  <PhotoPicker max={4} value={photos} onChange={setPhotos} />
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

