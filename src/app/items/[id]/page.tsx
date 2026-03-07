import { redirect } from "next/navigation";
import { fetchFirestoreDoc } from "@/lib/seo/firestorePublic";
import { itemSlug } from "@/lib/seo/slug";
import type { ItemListing } from "@/lib/firebase/models";

export const runtime = "nodejs";

export default async function ItemIdRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<ItemListing>("items", id);
  const slug = doc?.data
    ? itemSlug({
        title: doc.data.title,
        category: doc.data.category,
        area: doc.data.area,
        price: doc.data.price,
      })
    : "listing";
  redirect(`/items/${encodeURIComponent(id)}/${slug}`);
}
