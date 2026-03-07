import { Suspense } from "react";
import type { Metadata } from "next";
import RoomsLocationClient from "../shared/LocationRoomsClient";

export const metadata: Metadata = {
  title: "Student Rooms in Dharamshala | vStudent",
  description: "Find affordable rooms and PGs for students near colleges, markets and transport in Dharamshala. Filter by rent, amenities, and features like attached bathroom, veg-only, and walking distance to university.",
  keywords: ["student rooms dharamshala", "pg accommodation dharamshala", "rooms for students dharamshala", "hostel dharamshala", "student housing Dharamshala"],
  openGraph: {
    title: "Student Rooms in Dharamshala",
    description: "Browse student rooms and PG accommodations in Dharamshala with photos, prices, and contact details.",
    type: "website",
    url: "/rooms/dharamshala",
  },
  alternates: { 
    canonical: "/rooms/dharamshala" 
  },
};

export default function DharamshalaRoomsPage() {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsLocationClient location="dharamshala" />
    </Suspense>
  );
}
