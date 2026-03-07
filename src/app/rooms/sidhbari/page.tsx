import { Suspense } from "react";
import type { Metadata } from "next";
import RoomsLocationClient from "../shared/LocationRoomsClient";

export const metadata: Metadata = {
  title: "Student Rooms in Sidhbari Dharamshala | vStudent",
  description: "Find affordable rooms and PGs for students near colleges, markets and transport in Sidhbari, Dharamshala. Filter by rent, amenities, and features like attached bathroom, veg-only, and walking distance to university.",
  keywords: ["student rooms sidhbari", "pg accommodation sidhbari", "rooms for students sidhbari", "hostel sidhbari", "student housing Dharamshala"],
  openGraph: {
    title: "Student Rooms in Sidhbari Dharamshala",
    description: "Browse student rooms and PG accommodations in Sidhbari, Dharamshala with photos, prices, and contact details.",
    type: "website",
    url: "/rooms/sidhbari",
  },
  alternates: { 
    canonical: "/rooms/sidhbari" 
  },
};

export default function SidhbariRoomsPage() {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsLocationClient location="sidhbari" />
    </Suspense>
  );
}
