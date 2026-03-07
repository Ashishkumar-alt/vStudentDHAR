import type { MetadataRoute } from "next";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { listFirestoreDocs } from "@/lib/seo/firestorePublic";
import { itemSlug, roomSlug } from "@/lib/seo/slug";

const baseUrl = "https://vstudent.in";

function toDateOrNow(iso: string | null) {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const out: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/items`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rooms`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Dynamic listing URLs (only approved + active to avoid indexing thin/expired pages).
  // Uses Firestore public REST list endpoint. If your Firestore rules block public reads,
  // this will throw in production and should be replaced with a server-side data source.
  const maxPerCollection = 2000;

  async function addRooms() {
    let token: string | null = null;
    let added = 0;
    while (added < maxPerCollection) {
      let res: { docs: Array<{ id: string; data: RoomListing; updateTime: string | null }>; nextPageToken: string | null };
      try {
        res = await listFirestoreDocs<RoomListing>("rooms", { pageSize: 200, pageToken: token || undefined });
      } catch {
        break;
      }
      for (const doc of res.docs) {
        const d = doc.data;
        if (!d) continue;
        if ((d as unknown as { approved?: boolean }).approved !== true) continue;
        if ((d as unknown as { status?: string }).status !== "active") continue;
        const slug = roomSlug({ title: d.title, area: d.area, genderAllowed: d.genderAllowed, rent: d.rent });
        out.push({
          url: `${baseUrl}/rooms/${doc.id}/${slug}`,
          lastModified: toDateOrNow(doc.updateTime),
          changeFrequency: "weekly",
          priority: 0.7,
        });
        added += 1;
        if (added >= maxPerCollection) break;
      }
      token = res.nextPageToken;
      if (!token) break;
    }
  }

  async function addItems() {
    let token: string | null = null;
    let added = 0;
    while (added < maxPerCollection) {
      let res: { docs: Array<{ id: string; data: ItemListing; updateTime: string | null }>; nextPageToken: string | null };
      try {
        res = await listFirestoreDocs<ItemListing>("items", { pageSize: 200, pageToken: token || undefined });
      } catch {
        break;
      }
      for (const doc of res.docs) {
        const d = doc.data;
        if (!d) continue;
        if ((d as unknown as { approved?: boolean }).approved !== true) continue;
        if ((d as unknown as { status?: string }).status !== "active") continue;
        const slug = itemSlug({ title: d.title, category: d.category, area: d.area, price: d.price });
        out.push({
          url: `${baseUrl}/items/${doc.id}/${slug}`,
          lastModified: toDateOrNow(doc.updateTime),
          changeFrequency: "weekly",
          priority: 0.6,
        });
        added += 1;
        if (added >= maxPerCollection) break;
      }
      token = res.nextPageToken;
      if (!token) break;
    }
  }

  try {
    await Promise.all([addRooms(), addItems()]);
  } catch {
    // If Firestore listing is not publicly allowed (e.g. 403), keep the base sitemap only.
  }
  return out;
}