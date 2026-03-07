import type { Metadata } from "next";
import { fetchFirestoreDoc } from "@/lib/seo/firestorePublic";
import type { RoomListing } from "@/lib/firebase/models";
import RoomDetailsClient from "../RoomDetailsClient";
import { roomSlug } from "@/lib/seo/slug";

export const runtime = "nodejs";

function buildRoomTitle(listing: RoomListing) {
  const bits = [
    listing.title,
    listing.area ? `in ${listing.area}` : null,
    "Dharamshala",
    "PG & student rooms",
  ].filter(Boolean);
  return bits.join(" · ");
}

function buildRoomDescription(listing: RoomListing) {
  const rent = typeof listing.rent === "number" ? `Rent ₹${listing.rent}/month` : "Student room";
  const deposit = typeof listing.deposit === "number" ? `Deposit ₹${listing.deposit}` : "";
  const walk =
    typeof listing.walkMinutesToHPU === "number" ? `${listing.walkMinutesToHPU} min walk to Central University` : "";
  const features = [
    listing.genderAllowed ? `${listing.genderAllowed} allowed` : "",
    listing.foodIncluded ? "food included" : "",
    listing.attachedBathroom ? "attached bathroom" : "",
    listing.vegOnly ? "veg only" : "",
    listing.heaterIncluded ? "heater included" : "",
  ]
    .filter(Boolean)
    .join(", ");
  return [rent, deposit, walk, features].filter(Boolean).join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<RoomListing>("rooms", id);
  const listing = doc?.data;

  const canonical = listing ? `/rooms/${id}/${roomSlug({ title: listing.title, area: listing.area, genderAllowed: listing.genderAllowed, rent: listing.rent })}` : `/rooms/${id}`;

  if (!listing) {
    return {
      title: "Room not found",
      description: "This room listing was not found on vStudent.",
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const title = buildRoomTitle(listing);
  const description = buildRoomDescription(listing);
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

export default async function RoomDetailsSeoPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const doc = await fetchFirestoreDoc<RoomListing>("rooms", id);
  const listing = doc?.data || null;
  const canonicalPath =
    listing ? `/rooms/${id}/${roomSlug({ title: listing.title, area: listing.area, genderAllowed: listing.genderAllowed, rent: listing.rent })}` : null;

  const jsonLd =
    listing && canonicalPath
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: listing.title,
          description: listing.description || buildRoomDescription(listing),
          image: (listing.photoUrls || []).slice(0, 10),
          category: "Student room / PG",
          brand: { "@type": "Brand", name: "vStudent" },
          areaServed: "Dharamshala, Himachal Pradesh, India",
          url: `https://vstudent.in${canonicalPath}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: listing.rent,
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
      <RoomDetailsClient />
    </>
  );
}

