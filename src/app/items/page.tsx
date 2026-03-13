import { Suspense } from "react";
import type { Metadata } from "next";
import ItemsClient from "./ui";
import FeatureGate from "@/components/ui/FeatureGate";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Student Items in Dharamshala (Buy & Sell)",
  description:
    "Buy and sell used student items in Dharamshala—heaters, books, furniture and more. Post fast and contact directly on WhatsApp.",
  alternates: { canonical: "/items" },
};

export default function ItemsPage() {
  return (
    <Suspense>
      <FeatureGate 
        feature="ITEMS_FEATURE_ENABLED" 
        fallback={
          <ComingSoon 
            title="Items Marketplace"
            subtitle="Buy & sell books, electronics, furniture and more."
            badge="🚧 Coming Soon in v3"
            showNotifyButton={true}
          />
        }
      >
        <ItemsClient />
      </FeatureGate>
    </Suspense>
  );
}

