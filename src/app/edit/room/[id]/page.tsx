import { Suspense } from "react";
import type { Metadata } from "next";
import EditRoomClient from "./ui";

export const metadata: Metadata = {
  title: "Edit Room",
  description: "Edit your room listing on vStudent.",
  robots: { index: false, follow: false },
};

export default function EditRoomPage() {
  return (
    <Suspense>
      <EditRoomClient />
    </Suspense>
  );
}
