import { Suspense } from "react";
import ProfileClient from "./ui";

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileClient />
    </Suspense>
  );
}

