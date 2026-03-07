import { Suspense } from "react";
import type { Metadata } from "next";
import RoomsLocationClient from "../shared/LocationRoomsClient";

export const metadata: Metadata = {
  title: "Student Rooms near Central University Dharamshala | vStudent",
  description: "Find affordable rooms and PGs for students near Central University of Himachal Pradesh. Filter by rent, amenities, and features like attached bathroom, veg-only, and walking distance.",
  keywords: ["student rooms central university", "pg accommodation central university", "rooms for students central university", "hostel central university", "student housing Dharamshala"],
  openGraph: {
    title: "Student Rooms near Central University Dharamshala",
    description: "Browse student rooms and PG accommodations near Central University of Himachal Pradesh with photos, prices, and contact details.",
    type: "website",
    url: "/rooms/central-university",
  },
  alternates: { 
    canonical: "/rooms/central-university" 
  },
};

export default function CentralUniversityRoomsPage() {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsLocationClient location="central-university" />
    </Suspense>
  );
}
