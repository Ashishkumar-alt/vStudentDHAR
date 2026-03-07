"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { DEFAULT_CITY_ID } from "@/lib/constants";
import type { ItemListing, Report, RoomListing } from "@/lib/firebase/models";
import { itemsRef, reportsRef, roomsRef } from "@/lib/firebase/refs";
import { deleteItem, deleteRoom, setItemApproved, setRoomApproved } from "@/lib/firebase/listings";
import { watchIsAdmin } from "@/lib/firebase/admin";
import { setReportStatus } from "@/lib/firebase/reports";
import { itemSlug, roomSlug } from "@/lib/seo/slug";

function Row({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="mt-1 truncate text-xs text-zinc-600">{subtitle}</div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export default function AdminClient() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [rooms, setRooms] = useState<{ id: string; data: RoomListing }[]>([]);
  const [items, setItems] = useState<{ id: string; data: ItemListing }[]>([]);
  const [reports, setReports] = useState<{ id: string; data: Report }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setAdminLoading(true);
    const unsub = watchIsAdmin(
      user.uid,
      (val) => {
        setIsAdmin(val);
        setAdminLoading(false);
      },
      () => setAdminLoading(false),
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    setError(null);

    const qRooms = query(
      roomsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
      where("approved", "==", false),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const qItems = query(
      itemsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
      where("approved", "==", false),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const qReports = query(reportsRef(), orderBy("createdAt", "desc"), limit(50));

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
    const unsub3 = onSnapshot(
      qReports,
      (snap) => setReports(snap.docs.map((d) => ({ id: d.id, data: d.data() as Report }))),
      (e) => setError(e.message),
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user, isAdmin]);

  const cannot = useMemo(() => adminLoading || !isAdmin, [adminLoading, isAdmin]);
  const openReports = useMemo(
    () => reports.filter((r) => !r.data.status || r.data.status === "open"),
    [reports],
  );

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
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-zinc-600">Approve/delete listings and review reports.</p>

      <RequireAuth>
        {cannot ? (
          <div className="card mt-6 p-5 text-sm text-zinc-700">
            {adminLoading ? "Checking access..." : "Not authorized. Add your UID to Firestore collection `admins`."}
          </div>
        ) : (
          <>
            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            <section className="mt-8">
              <h2 className="text-sm font-semibold">Pending rooms</h2>
              <div className="card mt-3 overflow-hidden">
                {rooms.length ? (
                  rooms.map(({ id, data }) => (
                    <Row
                      key={id}
                      title={
                        <Link href={`/rooms/${id}/${roomSlug({ title: data.title, area: data.area, genderAllowed: data.genderAllowed, rent: data.rent })}`}>
                          {data.title}
                        </Link>
                      }
                      subtitle={`${data.area} · ${data.genderAllowed} · rent ₹${data.rent}`}
                      actions={
                        <>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `room:${id}`}
                            onClick={() => act(`room:${id}`, () => setRoomApproved(id, true))}
                          >
                            Approve
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `room:${id}`}
                            onClick={() => act(`room:${id}`, () => deleteRoom(id))}
                          >
                            Delete
                          </button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-600">No pending rooms.</div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold">Pending items</h2>
              <div className="card mt-3 overflow-hidden">
                {items.length ? (
                  items.map(({ id, data }) => (
                    <Row
                      key={id}
                      title={
                        <Link href={`/items/${id}/${itemSlug({ title: data.title, category: data.category, area: data.area, price: data.price })}`}>
                          {data.title}
                        </Link>
                      }
                      subtitle={`${data.category} · ${data.area} · price ₹${data.price}`}
                      actions={
                        <>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `item:${id}`}
                            onClick={() => act(`item:${id}`, () => setItemApproved(id, true))}
                          >
                            Approve
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `item:${id}`}
                            onClick={() => act(`item:${id}`, () => deleteItem(id))}
                          >
                            Delete
                          </button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-600">No pending items.</div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold">Reports</h2>
              <div className="card mt-3 overflow-hidden">
                {openReports.length ? (
                  openReports.map(({ id, data }) => (
                    <Row
                      key={id}
                      title={`${data.reason} · ${data.listingType}/${data.listingId}`}
                      subtitle={data.details || "—"}
                      actions={
                        <>
                          <Link
                            className="btn h-9 px-4 text-sm"
                            href={
                              data.listingType === "room"
                                ? `/rooms/${data.listingId}`
                                : `/items/${data.listingId}`
                            }
                          >
                            Open
                          </Link>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `report:${id}`}
                            onClick={() =>
                              act(`report:${id}`, () => setReportStatus(id, { status: "resolved", resolvedBy: user!.uid }))
                            }
                          >
                            Resolve
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm"
                            disabled={busyKey === `report:${id}`}
                            onClick={() =>
                              act(`report:${id}`, () => setReportStatus(id, { status: "ignored", resolvedBy: user!.uid }))
                            }
                          >
                            Ignore
                          </button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-600">No open reports.</div>
                )}
              </div>
            </section>
          </>
        )}
      </RequireAuth>
    </main>
  );
}

