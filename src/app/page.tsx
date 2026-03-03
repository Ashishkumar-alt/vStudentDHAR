import Link from "next/link";
import AreaQuickChips from "@/components/home/AreaQuickChips";
import DharamshalaPulse from "@/components/home/DharamshalaPulse";
import HomePreviews from "@/components/home/HomePreviews";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-16 px-4 py-10">
      <section className="card card-hover relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600" />
        <div
          className="absolute inset-0 opacity-[0.08] blur-2xl"
          style={{
            backgroundImage:
              "url(/dharamshala-hero.webp), url(/dharamshala-hero.jpg), url(/dharamshala-hero.jpeg), url(/dharamshala-hero.png), url(/hero-mountains.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative p-6 sm:p-12">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
            Dharamshala Edition - WhatsApp-only
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Find your perfect student space
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Near HPU, Kotwali Bazaar, Sidhpur, McLeodganj. Post fast, contact directly on WhatsApp.
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/90">
            Dhoop mein mat ghoomo. vStudent kholo. ☀️
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className="btn bg-white text-slate-900 hover:bg-white/90" href="/rooms">
              Browse Rooms â†’
            </Link>
            <Link className="btn border-white/30 bg-white/10 text-white hover:bg-white/15" href="/items">
              Browse Items
            </Link>
            <Link className="btn border-white/30 bg-white/10 text-white hover:bg-white/15" href="/post">
              + Post
            </Link>
          </div>

          <div className="mt-8">
            <AreaQuickChips />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card card-hover p-5">
          <div className="text-sm font-medium">Area-first search</div>
          <div className="mt-1 text-sm text-zinc-600">HPU Campus, Sidhpur, Kotwali Bazaarâ€¦</div>
        </div>
        <div className="card card-hover p-5">
          <div className="text-sm font-medium">Winter-ready listings</div>
          <div className="mt-1 text-sm text-zinc-600">Heaters, sun-facing rooms, warm gear.</div>
        </div>
        <div className="card card-hover p-5">
          <div className="text-sm font-medium">Trust cues</div>
          <div className="mt-1 text-sm text-zinc-600">Institution badge + phone verified.</div>
        </div>
      </div>

      <HomePreviews />

      <DharamshalaPulse />

      <section className="card card-hover overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-10 text-center text-white">
          <h2 className="text-3xl font-semibold">Have something to post?</h2>
          <p className="mt-2 text-sm text-white/90">
            List your room or item in minutes and connect with Dharamshala students directly.
          </p>
          <div className="mt-6 flex justify-center">
            <Link className="btn bg-white text-slate-900 hover:bg-white/90" href="/post">
              Post a Listing â†’
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
