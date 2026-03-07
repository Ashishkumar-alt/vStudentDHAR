import { Suspense } from "react";
import type { Metadata } from "next";
import RoomsLocationClient from "../shared/LocationRoomsClient";

export const metadata: Metadata = {
  title: "Student Rooms in McLeod Ganj Dharamshala | vStudent",
  description: "Find affordable rooms and PGs for students near colleges, markets and transport in McLeod Ganj, Dharamshala. Filter by rent, amenities, and features like attached bathroom, veg-only, and walking distance to university.",
  keywords: ["student rooms mcleodganj", "pg accommodation mcleodganj", "rooms for students mcleodganj", "hostel mcleodganj", "student housing Dharamshala"],
  openGraph: {
    title: "Student Rooms in McLeod Ganj Dharamshala",
    description: "Browse student rooms and PG accommodations in McLeod Ganj, Dharamshala with photos, prices, and contact details.",
    type: "website",
    url: "/rooms/mcleodganj",
  },
  alternates: { 
    canonical: "/rooms/mcleodganj" 
  },
};

export default function McLeodGanjRoomsPage() {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsLocationClient location="mcleodganj" />
    </Suspense>
  );
}
