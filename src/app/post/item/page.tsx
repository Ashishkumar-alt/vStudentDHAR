import { Suspense } from "react";
import type { Metadata } from "next";
import PostItemClient from "./ui";

export const metadata: Metadata = {
  title: "Post Item (Dharamshala)",
  description: "Post a used student item for sale in Dharamshala on vStudent.",
  alternates: { canonical: "/post/item" },
  robots: { index: false, follow: true },
};

export default function PostItemPage() {
  return (
    <Suspense>
      <PostItemClient />
    </Suspense>
  );
}

