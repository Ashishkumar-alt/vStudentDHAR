import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About vStudent",
  description:
    "vStudent is a hyperlocal student marketplace for Dharamshala—find rooms/PG near Central University and buy or sell used student items.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">About vStudent</h1>

            <p>
                vStudent is a hyperlocal student marketplace designed to help students
                find rooms, PG accommodation, and buy or sell used items near their college.
            </p>

            <h2 className="text-lg font-semibold">The Problem</h2>
            <p>
                Many students struggle to find affordable rooms or sell used items like
                books, tables, beds, and cycles when they move between hostels or cities.
            </p>

            <h2 className="text-lg font-semibold">Our Solution</h2>
            <p>
                vStudent connects students and local owners in one simple platform where
                they can list rooms and student essentials quickly and safely.
            </p>

            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p>
                Our goal is to make student life easier by providing a trusted place for
                housing and student marketplace listings.

                vStudent helps students in Dharamshala find rooms, PG accommodation,
                and buy or sell used items easily.
            </p>
        </main>
    );
}