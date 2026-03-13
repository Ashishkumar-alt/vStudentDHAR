import type { Metadata } from "next";
import Image from "next/image";
import AreaQuickChips from "@/components/home/AreaQuickChips";
import DharamshalaPulse from "@/components/home/DharamshalaPulse";
import HomePreviews from "@/components/home/HomePreviews";
import { PRIMARY_INSTITUTION_SHORT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Rooms & PG in Dharamshala for Students",
  description:
    "vStudent is a local student marketplace to find rooms and PG in Dharamshala near Central University. Browse verified listings, filter by area, and contact owners on WhatsApp.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 space-y-16 py-10">
      <section className="card card-hover relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600" />
        <div className="absolute inset-0 opacity-[0.18] blur-2xl sm:opacity-[0.14]">
          <Image
            src="/dharamshala-hero.webp"
            alt="Dharamshala mountains background"
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: '50% 20%',
            }}
            priority
          />
        </div>
        <div className="relative p-6 sm:p-12 md:p-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              Dharamshala student Marketplace
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Find rooms & student items
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg md:text-xl max-w-3xl mx-auto">
              Near {PRIMARY_INSTITUTION_SHORT}, Kachcheri, Sakoh Upper. Post fast, contact directly on WhatsApp.
            </p>
            <p className="mt-2 text-sm font-medium text-white/90 sm:text-base md:text-lg">
              Dhoop mein mat ghoomo. vStudent kholo.
            </p>

            <div className="mt-8 md:mt-10">
              <AreaQuickChips />
            </div>
          </div>
        </div>
      </section>

      <HomePreviews />

      <DharamshalaPulse />
    </main>
  );
}
