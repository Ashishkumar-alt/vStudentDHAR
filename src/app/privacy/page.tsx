import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-screen-md space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-600">Last updated: March 5, 2026</p>
      </header>

      <section className="card p-6 text-sm leading-6 text-slate-700">
        <p>
          vStudent is a student marketplace for rooms and used items. This Privacy Policy explains what data we collect, how
          we use it, and your choices.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Information we collect</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium">Account data:</span> email address and basic profile details you provide.
          </li>
          <li>
            <span className="font-medium">Listings and content:</span> the details, photos, and contact information you
            choose to include in your listings.
          </li>
          <li>
            <span className="font-medium">Usage data:</span> basic analytics and logs needed to operate and secure the
            service.
          </li>
        </ul>

        <h2 className="mt-6 text-base font-semibold text-slate-900">How we use information</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Provide, maintain, and improve the marketplace experience.</li>
          <li>Enable login, listing creation, and basic account features.</li>
          <li>Prevent abuse, fraud, and enforce platform rules.</li>
          <li>Respond to support requests.</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Sharing</h2>
        <p className="mt-2">
          Listings are public by design and may include contact details you choose to share (for example, a phone number
          for WhatsApp). We do not sell your personal information. We may share data with service providers (for example,
          hosting and image storage) to run the app, or if required by law.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Your choices</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Update or delete your listings from your account.</li>
          <li>Request account deletion by contacting us.</li>
          <li>Do not include sensitive personal information in listings.</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Security</h2>
        <p className="mt-2">
          We use reasonable technical and organizational measures to protect information, but no method of transmission or
          storage is 100% secure.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Changes</h2>
        <p className="mt-2">
          We may update this policy from time to time. We will post the updated version on this page with a new “Last
          updated” date.
        </p>
      </section>
    </main>
  );
}

