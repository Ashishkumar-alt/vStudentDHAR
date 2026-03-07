import { Suspense } from "react";
import type { Metadata } from "next";
import PostRoomClient from "./ui";

export const metadata: Metadata = {
  title: "Post Room (Dharamshala)",
  description: "Post a room/PG listing in Dharamshala on vStudent.",
  alternates: { canonical: "/post/room" },
  robots: { index: false, follow: true },
};

export default function PostRoomPage() {
  return (
    <Suspense>
      <PostRoomClient />
    </Suspense>
  );
}

