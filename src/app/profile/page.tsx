import { Suspense } from "react";
import type { Metadata } from "next";
import ProfileClient from "./ui";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your vStudent profile.",
  alternates: { canonical: "/profile" },
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileClient />
    </Suspense>
  );
}

