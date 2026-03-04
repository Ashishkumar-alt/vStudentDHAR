import { Suspense } from "react";
import RoomsClient from "./ui";

export default function RoomsPage() {
  return (
    <Suspense>
      <RoomsClient />
    </Suspense>
  );
}

