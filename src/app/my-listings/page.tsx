"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { itemsRef, roomsRef } from "@/lib/firebase/refs";
import { deleteItem, deleteRoom, markItemSold, markRoomSold } from "@/lib/firebase/listings";
import { getItemViewsCount, getRoomViewsCount } from "@/lib/firebase/views";
import { formatINR } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Eye, Trash2, CheckCircle2, Pencil } from "lucide-react";

function StatusPill({ approved, status }: { approved: boolean; status: string }) {
  const text = !approved ? "Pending" : status === "sold" ? "Sold" : "Active";
  const cls =
    !approved
      ? "bg-amber-100 text-amber-800"
      : status === "sold"
        ? "bg-zinc-200 text-zinc-800"
        : "bg-green-100 text-green-800";
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${cls}`}>{text}</span>;
}

export default function MyListingsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<{ id: string; data: RoomListing }[] | null>(null);
  const [items, setItems] = useState<{ id: string; data: ItemListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [views, setViews] = useState<Record<string, number>>({});
  const [viewsLoading, setViewsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setError(null);
    const qRooms = query(roomsRef(), where("createdBy", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
    const qItems = query(itemsRef(), where("createdBy", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
    const unsub1 = onSnapshot(
      qRooms,
      (snap) => setRooms(snap.docs.map((d) => ({ id: d.id, data: d.data() as RoomListing }))),
      (e) => setError(e.message),
    );
    const unsub2 = onSnapshot(
      qItems,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, data: d.data() as ItemListing }))),
      (e) => setError(e.message),
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const empty = useMemo(() => (rooms?.length || 0) === 0 && (items?.length || 0) === 0, [rooms, items]);
  const loading = rooms === null || items === null;

  const stats = useMemo(() => {
    const all = [...(rooms || []), ...(items || [])];
    const active = all.filter((x) => x.data.status === "active").length;
    const sold = all.filter((x) => x.data.status === "sold").length;
    return { active, sold, total: all.length };
  }, [rooms, items]);

  const totalViews = useMemo(() => Object.values(views).reduce((a, b) => a + b, 0), [views]);

  useEffect(() => {
    if (!user) return;
    if (rooms === null || items === null) return;
    let alive = true;
    setViewsLoading(true);

    const roomJobs = (rooms || []).map(async (r) => {
      const count = await getRoomViewsCount(r.id);
      return [`room:${r.id}`, count] as const;
    });
    const itemJobs = (items || []).map(async (it) => {
      const count = await getItemViewsCount(it.id);
      return [`item:${it.id}`, count] as const;
    });

    Promise.all([...roomJobs, ...itemJobs])
      .then((pairs) => {
        if (!alive) return;
        const next: Record<string, number> = {};
        for (const [k, v] of pairs) next[k] = v;
        setViews(next);
      })
      .catch(() => {})
      .finally(() => {
        if (!alive) return;
        setViewsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [items, rooms, user]);

  async function act(nextBusyKey: string, fn: () => Promise<void>) {
    setBusyKey(nextBusyKey);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">My listings</h1>
      <p className="mt-1 text-sm text-zinc-600">Manage your posted rooms and items.</p>

      <RequireAuth>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="card p-4">
            <div className="text-xs font-medium text-slate-600">Active</div>
            <div className="mt-1 text-2xl font-semibold">{loading ? "—" : stats.active}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-medium text-slate-600">Sold</div>
            <div className="mt-1 text-2xl font-semibold">{loading ? "—" : stats.sold}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-medium text-slate-600">Total</div>
            <div className="mt-1 text-2xl font-semibold">{loading ? "—" : stats.total}</div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Eye className="h-4 w-4" />
              Total views
            </div>
            <div className="mt-1 text-2xl font-semibold">{loading || viewsLoading ? "—" : totalViews}</div>
            <div className="mt-1 text-xs text-slate-500">Unique signed-in views</div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {empty ? (
          <div className="card mt-8 p-6">
            <p className="text-sm text-zinc-600">No listings yet.</p>
            <div className="mt-4 flex gap-3">
              <Link className="btn btn-primary" href="/post/room">
                Post room
              </Link>
              <Link className="btn" href="/post/item">
                Post item
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : null}

        {rooms?.length ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold">Rooms</h2>
            <div className="card mt-3 overflow-hidden">
              {rooms.map(({ id, data }) => (
                <div key={id} className="flex flex-col gap-2 border-b border-zinc-100 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link href={`/rooms/${id}`} className="truncate text-sm font-medium hover:underline">
                      {data.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-600">
                      {data.area} · {formatINR(data.rent)}/mo · {views[`room:${id}`] ?? 0} views
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill approved={data.approved} status={data.status} />
                    <Link className="btn h-9 px-4 text-sm" href={`/edit/room/${id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                    {data.status !== "sold" ? (
                      <button
                        className="btn h-9 px-4 text-sm"
                        disabled={busyKey === `roomSold:${id}`}
                        onClick={() => act(`roomSold:${id}`, () => markRoomSold(id))}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark sold
                      </button>
                    ) : null}
                    <button
                      className="btn h-9 px-4 text-sm"
                      disabled={busyKey === `roomDel:${id}`}
                      onClick={() => act(`roomDel:${id}`, () => deleteRoom(id))}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {items?.length ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold">Items</h2>
            <div className="card mt-3 overflow-hidden">
              {items.map(({ id, data }) => (
                <div key={id} className="flex flex-col gap-2 border-b border-zinc-100 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link href={`/items/${id}`} className="truncate text-sm font-medium hover:underline">
                      {data.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-600">
                      {data.category} · {formatINR(data.price)} · {views[`item:${id}`] ?? 0} views
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill approved={data.approved} status={data.status} />
                    <Link className="btn h-9 px-4 text-sm" href={`/edit/item/${id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                    {data.status !== "sold" ? (
                      <button
                        className="btn h-9 px-4 text-sm"
                        disabled={busyKey === `itemSold:${id}`}
                        onClick={() => act(`itemSold:${id}`, () => markItemSold(id))}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark sold
                      </button>
                    ) : null}
                    <button
                      className="btn h-9 px-4 text-sm"
                      disabled={busyKey === `itemDel:${id}`}
                      onClick={() => act(`itemDel:${id}`, () => deleteItem(id))}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </RequireAuth>
    </main>
  );
}

