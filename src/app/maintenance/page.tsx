import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Mode - vStudent",
  description: "vStudent is temporarily under maintenance for security upgrades.",
  robots: "noindex, nofollow",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm">
            <span className="text-2xl font-bold text-blue-600">vS</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          vStudent is upgrading
        </h1>
        
        <p className="text-lg text-slate-600 mb-6">
          We are improving security and adding better features to help students find safe accommodation.
        </p>
        
        <p className="text-sm text-slate-500">
          The platform will be available again soon.
        </p>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Thank you for your patience. We're working to make vStudent better for you.
          </p>
        </div>
      </div>
    </div>
  );
}
