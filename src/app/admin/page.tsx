import { Suspense } from "react";
import type { Metadata } from "next";
import AdminClient from "./ui";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin dashboard.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense>
      <AdminClient />
    </Suspense>
  );
}

