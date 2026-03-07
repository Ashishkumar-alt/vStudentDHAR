import { Suspense } from "react";
import type { Metadata } from "next";
import RoomsClient from "./ui";

export const metadata: Metadata = {
  title: "Rooms in Dharamshala (PG & Student Rooms)",
  description:
    "Browse student rooms and PG in Dharamshala near Central University. Filter by area, rent, and features like attached bathroom, veg-only, and walking distance.",
  alternates: { canonical: "/rooms" },
};

export default function RoomsPage() {
  return (
    <Suspense>
      <RoomsClient />
    </Suspense>
  );
}

