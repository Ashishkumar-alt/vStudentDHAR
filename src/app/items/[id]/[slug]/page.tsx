import type { Metadata } from "next";
import { fetchFirestoreDoc } from "@/lib/seo/firestorePublic";
import type { ItemListing } from "@/lib/firebase/models";
import ItemDetailsClient from "../ItemDetailsClient";
import { itemSlug } from "@/lib/seo/slug";

export const runtime = "nodejs";

function buildItemTitle(listing: ItemListing) {
  const bits = [listing.title, listing.category, listing.area ? `in ${listing.area}` : null, "Dharamshala"].filter(Boolean);
  return bits.join(" · ");
}

function buildItemDescription(listing: ItemListing) {
  const price = typeof listing.price === "number" ? `Price ₹${listing.price}` : "Student item";
  return [price, listing.condition, listing.area ? `Pick up in ${listing.area}` : null].filter(Boolean).join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<ItemListing>("items", id);
  const listing = doc?.data;

  const canonical = listing
    ? `/items/${id}/${itemSlug({ title: listing.title, category: listing.category, area: listing.area, price: listing.price })}`
    : `/items/${id}`;

  if (!listing) {
    return {
      title: "Item not found",
      description: "This item listing was not found on vStudent.",
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const title = buildItemTitle(listing);
  const description = buildItemDescription(listing);
  const images = (listing.photoUrls || []).slice(0, 6);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: images.length ? images : undefined,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: images.length ? images : undefined,
    },
  };
}

export default async function ItemDetailsSeoPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<ItemListing>("items", id);
  const listing = doc?.data || null;
  const canonicalPath =
    listing ? `/items/${id}/${itemSlug({ title: listing.title, category: listing.category, area: listing.area, price: listing.price })}` : null;

  const jsonLd =
    listing && canonicalPath
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: listing.title,
          description: listing.description || buildItemDescription(listing),
          image: (listing.photoUrls || []).slice(0, 10),
          category: listing.category,
          brand: { "@type": "Brand", name: "vStudent" },
          areaServed: "Dharamshala, Himachal Pradesh, India",
          url: `https://vstudent.in${canonicalPath}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: listing.price,
            availability: listing.status === "sold" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          },
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <ItemDetailsClient />
    </>
  );
}

