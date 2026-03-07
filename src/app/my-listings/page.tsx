import { Suspense } from "react";
import type { Metadata } from "next";
import MyListingsClient from "./ui";

export const metadata: Metadata = {
  title: "My Listings",
  description: "Manage your posted rooms and items.",
  alternates: { canonical: "/my-listings" },
  robots: { index: false, follow: true },
};

export default function MyListingsPage() {
  return (
    <Suspense>
      <MyListingsClient />
    </Suspense>
  );
}

