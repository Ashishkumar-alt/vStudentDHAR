"use client";

import Link from "next/link";
import { useItems, useRooms } from "@/components/listings/useListings";
import { ItemCard, RoomCard } from "@/components/listings/ListingCard";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HomePreviews() {
  const { rows: rooms, loading: roomsLoading } = useRooms();
  const { rows: items, loading: itemsLoading } = useItems();

  return (
    <div className="space-y-12">
      <section className="card overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl md:text-2xl">Rooms near you</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)] sm:text-base">Fresh Dharamshala listings (area-first).</p>
          </div>
          <Link className="btn h-9 px-4 text-sm sm:h-10 sm:px-5 md:h-11 md:px-6" href="/rooms">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {roomsLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : rooms.slice(0, 8).map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)}
        </div>
      </section>

      <section className="card overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl md:text-2xl">Items trending</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)] sm:text-base">Heaters, scooters, winter essentials.</p>
          </div>
          <Link className="btn h-9 px-4 text-sm sm:h-10 sm:px-5 md:h-11 md:px-6" href="/items">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itemsLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : items.slice(0, 8).map(({ id, data }) => <ItemCard key={id} id={id} listing={data} />)}
        </div>
      </section>
    </div>
  );
}
