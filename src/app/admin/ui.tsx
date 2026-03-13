"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DEFAULT_CITY_ID } from "@/lib/constants";
import type { ItemListing, Report, RoomListing } from "@/lib/firebase/models";
import type { Timestamp } from "firebase/firestore";
import { itemsRef, reportsRef, roomsRef } from "@/lib/firebase/refs";
import {
  approveItem,
  approveRoom,
  deleteItem,
  deleteRoom,
  rejectItem,
  rejectRoom,
  softDeleteItem,
  softDeleteRoom,
} from "@/lib/firebase/listings";
import { watchIsAdmin } from "@/lib/firebase/admin";
import { setReportStatus } from "@/lib/firebase/reports";
import { itemSlug, roomSlug } from "@/lib/seo/slug";
import { CheckCircle, XCircle, Trash2, Shield, Home, Package, Clock, Mail, Calendar } from "lucide-react";

// Helper function to format date
function formatDate(timestamp: Timestamp | Date | null | undefined): string {
  if (!timestamp) return "Unknown";
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Row({
  title,
  subtitle,
  details,
  actions,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  details?: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] p-4 last:border-b-0 hover:bg-[color:var(--muted)]/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="mt-1 truncate text-xs text-zinc-600">{subtitle}</div>
        {details && <div className="mt-1 text-xs text-zinc-500">{details}</div>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export default function AdminClient() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<{ id: string; data: RoomListing }[]>([]);
  const [items, setItems] = useState<{ id: string; data: ItemListing }[]>([]);
  const [reports, setReports] = useState<{ id: string; data: Report }[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/rooms");
    }
  }, [isAdmin, adminLoading, router]);

  async function moderateListing(action: "approve" | "reject" | "delete", type: "room" | "item", id: string, reason?: string) {
    if (!user) {
      throw new Error("You must be signed in.");
    }

    const adminEmail = user.email || "admin@vstudent.in";

    if (type === "room") {
      if (action === "approve") {
        await approveRoom(id, user.uid, adminEmail);
        return;
      }

      if (action === "reject") {
        await rejectRoom(id, user.uid, adminEmail, reason);
        return;
      }

      await softDeleteRoom(id, user.uid, adminEmail, reason);
      return;
    }

    if (action === "approve") {
      await approveItem(id, user.uid, adminEmail);
      return;
    }

    if (action === "reject") {
      await rejectItem(id, user.uid, adminEmail, reason);
      return;
    }

    await softDeleteItem(id, user.uid, adminEmail, reason);
  }

  useEffect(() => {
    if (!user || !isAdmin) return;
    setError(null);

    // Show ALL listings (not just pending)
    const qRooms = query(
      roomsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const qItems = query(
      itemsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
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

  const cannot = useMemo(() => !isAdmin, [isAdmin]);
  const openReports = useMemo(
    () => reports.filter((r) => !r.data.status || r.data.status === "open"),
    [reports],
  );
  const pendingRoomsCount = useMemo(() => rooms.filter(({ data }) => data.status === "pending").length, [rooms]);
  const pendingItemsCount = useMemo(() => items.filter(({ data }) => data.status === "pending").length, [items]);

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
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Approve/delete listings and review reports.</p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingRoomsCount}</p>
                <p className="text-sm text-gray-500">Pending Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingItemsCount}</p>
                <p className="text-sm text-gray-500">Pending Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{openReports.length}</p>
                <p className="text-sm text-gray-500">Open Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RequireAuth>
        {cannot ? (
          <div className="card mt-6 p-5 text-sm text-zinc-700">
            Not authorized. Admin access required.
          </div>
        ) : (
          <>
            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            <section className="mt-8">
              <h2 className="text-sm font-semibold">All Rooms</h2>
              <div className="card mt-3 overflow-hidden">
                {rooms.length ? (
                  rooms.map(({ id, data }) => (
                    <Row
                      key={id}
                      title={
                        <Link href={`/rooms/${id}/${roomSlug({ title: data.title, area: data.area, genderAllowed: data.genderAllowed, rent: data.rent })}`}>
                          <div className="flex items-center gap-2">
                            {data.photoUrls?.[0] && (
                              <Image
                                src={data.photoUrls[0]}
                                alt={data.title}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              {data.title}
                              <div className="text-xs font-medium" style={{
                                color: data.status === 'active' ? '#10b981' : 
                                       data.status === 'rejected' ? '#ef4444' : 
                                       data.status === 'deleted' ? '#6b7280' :
                                       data.status === 'sold' ? '#6b7280' : '#f59e0b'
                              }}>
                                {data.status === 'active' ? 'Active' : 
                                 data.status === 'rejected' ? 'Rejected' : 
                                 data.status === 'deleted' ? 'Deleted' :
                                 data.status === 'sold' ? 'Sold' : 
                                 'Pending'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      }
                      subtitle={`${data.area} · ${data.genderAllowed} · rent ₹${data.rent}`}
                      details={
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Owner: {data.createdBy ? "Loading..." : "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(data.createdAt)}
                          </span>
                        </div>
                      }
                      actions={
                        <>
                          <button
                            className="btn h-9 px-4 text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                            disabled={busyKey === `room:${id}`}
                            onClick={() => act(`room:${id}`, () => moderateListing("approve", "room", id))}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            disabled={busyKey === `room:${id}`}
                            onClick={() => act(`room:${id}`, () => moderateListing("reject", "room", id))}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            disabled={busyKey === `room:${id}`}
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
                                act(`room:${id}`, () => moderateListing("delete", "room", id));
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-600">No rooms found.</div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold">All Items</h2>
              <div className="card mt-3 overflow-hidden">
                {items.length ? (
                  items.map(({ id, data }) => (
                    <Row
                      key={id}
                      title={
                        <Link href={`/items/${id}/${itemSlug({ title: data.title, category: data.category, area: data.area, price: data.price })}`}>
                          <div className="flex items-center gap-2">
                            {data.photoUrls?.[0] && (
                              <Image
                                src={data.photoUrls[0]}
                                alt={data.title}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              {data.title}
                              <div className="text-xs font-medium" style={{
                                color: data.status === 'active' ? '#10b981' : 
                                       data.status === 'rejected' ? '#ef4444' : 
                                       data.status === 'deleted' ? '#6b7280' :
                                       data.status === 'sold' ? '#6b7280' : '#f59e0b'
                              }}>
                                {data.status === 'active' ? 'Active' : 
                                 data.status === 'rejected' ? 'Rejected' : 
                                 data.status === 'deleted' ? 'Deleted' :
                                 data.status === 'sold' ? 'Sold' : 
                                 'Pending'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      }
                      subtitle={`${data.category} · ${data.area} · price ₹${data.price}`}
                      details={
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Owner: {data.createdBy ? "Loading..." : "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(data.createdAt)}
                          </span>
                        </div>
                      }
                      actions={
                        <>
                          <button
                            className="btn h-9 px-4 text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                            disabled={busyKey === `item:${id}`}
                            onClick={() => act(`item:${id}`, () => moderateListing("approve", "item", id))}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            disabled={busyKey === `item:${id}`}
                            onClick={() => act(`item:${id}`, () => moderateListing("reject", "item", id))}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                          <button
                            className="btn h-9 px-4 text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            disabled={busyKey === `item:${id}`}
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
                                act(`item:${id}`, () => moderateListing("delete", "item", id));
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-600">No items found.</div>
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
                          <button
                            className="btn h-9 px-4 text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            disabled={busyKey === `report:${id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this ${data.listingType}? This action cannot be undone.`)) {
                                act(`report:${id}`, async () => {
                                  // Delete the actual listing that was reported
                                  if (data.listingType === 'room') {
                                    await deleteRoom(data.listingId);
                                  } else if (data.listingType === 'item') {
                                    await deleteItem(data.listingId);
                                  }
                                  // Also resolve the report
                                  await setReportStatus(id, { status: "resolved", resolvedBy: user!.uid });
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Listing
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
