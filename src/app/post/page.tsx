import Link from "next/link";
import { Home, Package } from "lucide-react";
import { PRIMARY_INSTITUTION_SHORT } from "@/lib/constants";

export default function PostPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Post a listing</h1>
      <p className="mt-2 text-sm text-zinc-600">Choose what you want to post.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/post/room"
          className="card card-hover relative overflow-hidden bg-emerald-50/60 p-6"
        >
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold">🏠 Post Room</div>
              <div className="mt-1 text-sm text-slate-600">Heater, walk-to-{PRIMARY_INSTITUTION_SHORT}, veg, photos.</div>
              <div className="mt-4 inline-flex text-sm font-medium text-slate-900 underline underline-offset-4">
                Continue
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/post/item"
          className="card card-hover relative overflow-hidden bg-sky-50/70 p-6"
        >
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold">📦 Sell Item</div>
              <div className="mt-1 text-sm text-slate-600">Heaters, scooters, winter essentials.</div>
              <div className="mt-4 inline-flex text-sm font-medium text-slate-900 underline underline-offset-4">
                Continue
              </div>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
