import { Suspense } from "react";
import type { Metadata } from "next";
import EditItemClient from "./ui";

export const metadata: Metadata = {
  title: "Edit Item",
  description: "Edit your item listing on vStudent.",
  robots: { index: false, follow: false },
};

export default function EditItemPage() {
  return (
    <Suspense>
      <EditItemClient />
    </Suspense>
  );
}

