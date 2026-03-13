import { Suspense } from "react";
import type { Metadata } from "next";
import PostItemClient from "./ui";
import FeatureGate from "@/components/ui/FeatureGate";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Post Item (Dharamshala)",
  description: "Post a used student item for sale in Dharamshala on vStudent.",
  alternates: { canonical: "/post/item" },
  robots: { index: false, follow: true },
};

export default function PostItemPage() {
  return (
    <Suspense>
      <FeatureGate 
        feature="ITEMS_FEATURE_ENABLED" 
        fallback={
          <ComingSoon 
            title="Sell Items"
            subtitle="Post your used books, electronics, furniture and more for sale."
            badge="🚧 Coming Soon in v3"
            showNotifyButton={true}
          />
        }
      >
        <PostItemClient />
      </FeatureGate>
    </Suspense>
  );
}

