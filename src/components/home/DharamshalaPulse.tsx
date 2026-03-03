"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRooms, useItems } from "@/components/listings/useListings";
import { INSTITUTIONS } from "@/lib/constants";

function isToday(d?: Date) {
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DharamshalaPulse() {
  const { rows: rooms } = useRooms();
  const { rows: items } = useItems();

  const stats = useMemo(() => {
    const heaterToday = items.filter((x) => x.data.category === "Room Heater" && isToday(x.data.createdAt?.toDate?.()))
      .length;
    const scooterToday = items.filter((x) => x.data.category === "Scooter" && isToday(x.data.createdAt?.toDate?.()))
      .length;
    const roomsNearHPU = rooms.filter((x) => typeof x.data.walkMinutesToHPU === "number" && x.data.walkMinutesToHPU <= 10)
      .length;
    const hpuLabel = INSTITUTIONS[0];
    const hpuListings = rooms.filter((x) => x.data.institution === hpuLabel).length + items.filter((x) => x.data.institution === hpuLabel).length;
    return { heaterToday, scooterToday, roomsNearHPU, hpuListings };
  }, [items, rooms]);

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      <div className="card p-5">
        <div className="text-sm font-semibold">Trending in Dharamshala</div>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>🔥 {stats.heaterToday} heaters listed today</li>
          <li>🏠 {stats.roomsNearHPU} rooms within ~10 min walk of HPU</li>
          <li>🛵 {stats.scooterToday} scooters listed today</li>
        </ul>
        <p className="mt-3 text-xs text-zinc-500">Counts are from currently loaded listings.</p>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold">Trust snapshot</div>
        <p className="mt-2 text-sm text-zinc-700">{stats.hpuListings} listings posted by HPU students (loaded).</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn btn-primary" href="/rooms">
            Browse rooms
          </Link>
          <Link className="btn" href="/items">
            Browse items
          </Link>
        </div>
      </div>
    </div>
  );
}

