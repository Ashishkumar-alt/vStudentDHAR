import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-screen-md space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Terms &amp; Conditions</h1>
        <p className="text-sm text-slate-600">Last updated: March 5, 2026</p>
      </header>

      <section className="card p-6 text-sm leading-6 text-slate-700">
        <p>
          These Terms govern your use of vStudent (the “Service”). By using the Service, you agree to these Terms.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">What vStudent provides</h2>
        <p className="mt-2">
          vStudent is a marketplace that helps students discover and post listings for rooms/PGs and used items. We do not
          own the items or properties listed, and we are not a party to transactions between users.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">User responsibilities</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Provide accurate information in your account and listings.</li>
          <li>Only post content you have the right to share (including photos).</li>
          <li>Do not post illegal, misleading, or harmful content.</li>
          <li>Use the Service respectfully and do not attempt to exploit or disrupt it.</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Listings and contact</h2>
        <p className="mt-2">
          Listings may contain contact details (for example, a phone number for WhatsApp). If you include personal contact
          details in a listing, you understand it may be visible to others.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Moderation</h2>
        <p className="mt-2">
          We may remove or restrict content that violates these Terms or is otherwise harmful to the community. We may
          suspend or terminate accounts for repeated or severe violations.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Disclaimers</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>The Service is provided “as is” without warranties of any kind.</li>
          <li>We do not guarantee the accuracy or reliability of any listing.</li>
          <li>You are responsible for verifying listings and taking precautions when meeting or transacting.</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Limitation of liability</h2>
        <p className="mt-2">
          To the maximum extent permitted by law, vStudent will not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or data, arising from your use of the Service.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-900">Changes</h2>
        <p className="mt-2">
          We may update these Terms from time to time. We will post the updated version on this page with a new “Last
          updated” date.
        </p>
      </section>
    </main>
  );
}

