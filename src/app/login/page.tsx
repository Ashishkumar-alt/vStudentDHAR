import { Suspense } from "react";
import type { Metadata } from "next";
import LoginClient from "./ui";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to vStudent.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}

