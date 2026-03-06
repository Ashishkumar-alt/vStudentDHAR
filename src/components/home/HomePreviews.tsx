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
      <section className="card overflow-hidden p-6 sm:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Rooms near you</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Fresh Dharamshala listings (area-first).</p>
          </div>
          <Link className="btn h-9 px-4 text-sm" href="/rooms">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roomsLoading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : rooms.slice(0, 6).map(({ id, data }) => <RoomCard key={id} id={id} listing={data} />)}
        </div>
      </section>

      <section className="card overflow-hidden p-6 sm:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Items trending</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Heaters, scooters, winter essentials.</p>
          </div>
          <Link className="btn h-9 px-4 text-sm" href="/items">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itemsLoading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : items.slice(0, 6).map(({ id, data }) => <ItemCard key={id} id={id} listing={data} />)}
        </div>
      </section>
    </div>
  );
}
