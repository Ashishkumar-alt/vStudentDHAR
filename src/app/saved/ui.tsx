"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { getItem, getRoom } from "@/lib/firebase/listings";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { ItemCard, RoomCard } from "@/components/listings/ListingCard";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function SavedClient() {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [rooms, setRooms] = useState<{ id: string; data: RoomListing }[]>([]);
  const [items, setItems] = useState<{ id: string; data: ItemListing }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...favorites].sort(
      (a, b) => (b.data.createdAt?.toMillis?.() || 0) - (a.data.createdAt?.toMillis?.() || 0),
    );
  }, [favorites]);

  useEffect(() => {
    if (!user) return;
    let alive = true;

    const t = setTimeout(() => {
      setLoading(true);
      setError(null);

      const roomIds = sorted.filter((f) => f.data.listingType === "room").map((f) => f.data.listingId);
      const itemIds = sorted.filter((f) => f.data.listingType === "item").map((f) => f.data.listingId);

      Promise.all([
        Promise.all(roomIds.map((id) => getRoom(id))).then((res) =>
          res.filter(Boolean).map((x) => ({ id: x!.id, data: x!.data as RoomListing })),
        ),
        Promise.all(itemIds.map((id) => getItem(id))).then((res) =>
          res.filter(Boolean).map((x) => ({ id: x!.id, data: x!.data as ItemListing })),
        ),
      ])
        .then(([nextRooms, nextItems]) => {
          if (!alive) return;
          setRooms(nextRooms);
          setItems(nextItems);
        })
        .catch((e) => {
          if (!alive) return;
          setError(e instanceof Error ? e.message : "Failed to load saved listings");
        })
        .finally(() => {
          if (!alive) return;
          setLoading(false);
        });
    }, 0);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [sorted, user]);

  const empty = !favoritesLoading && !loading && rooms.length === 0 && items.length === 0;

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Saved</h1>
          <p className="mt-1 text-sm text-zinc-600">Your saved rooms and items.</p>
        </div>
        <Link className="btn" href="/rooms">
          Browse rooms
        </Link>
      </div>

      <RequireAuth>
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {favoritesLoading || loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {empty ? (
          <div className="card mt-6 p-6">
            <p className="text-sm text-zinc-600">No saved listings yet.</p>
            <p className="mt-2 text-xs text-zinc-500">Tap the heart on any listing to save it here.</p>
          </div>
        ) : null}

        {rooms.length ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold">Rooms</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r) => (
                <RoomCard key={r.id} id={r.id} listing={r.data} />
              ))}
            </div>
          </section>
        ) : null}

        {items.length ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold">Items</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <ItemCard key={it.id} id={it.id} listing={it.data} />
              ))}
            </div>
          </section>
        ) : null}
      </RequireAuth>
    </main>
  );
}

