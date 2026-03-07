import { redirect } from "next/navigation";
import { fetchFirestoreDoc } from "@/lib/seo/firestorePublic";
import { roomSlug } from "@/lib/seo/slug";
import type { RoomListing } from "@/lib/firebase/models";

export const runtime = "nodejs";

export default async function RoomIdRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<RoomListing>("rooms", id);
  const slug = doc?.data
    ? roomSlug({
        title: doc.data.title,
        area: doc.data.area,
        genderAllowed: doc.data.genderAllowed,
        rent: doc.data.rent,
      })
    : "listing";

  redirect(`/rooms/${encodeURIComponent(id)}/${slug}`);
}
