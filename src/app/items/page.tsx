import { Suspense } from "react";
import type { Metadata } from "next";
import ItemsClient from "./ui";

export const metadata: Metadata = {
  title: "Student Items in Dharamshala (Buy & Sell)",
  description:
    "Buy and sell used student items in Dharamshala—heaters, books, furniture and more. Post fast and contact directly on WhatsApp.",
  alternates: { canonical: "/items" },
};

export default function ItemsPage() {
  return (
    <Suspense>
      <ItemsClient />
    </Suspense>
  );
}

