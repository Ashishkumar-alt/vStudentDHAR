import { Suspense } from "react";
import type { Metadata } from "next";
import SavedClient from "./ui";

export const metadata: Metadata = {
  title: "Saved Listings",
  description: "Your saved rooms and items on vStudent.",
  alternates: { canonical: "/saved" },
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <Suspense>
      <SavedClient />
    </Suspense>
  );
}
