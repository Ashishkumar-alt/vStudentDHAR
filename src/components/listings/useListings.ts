"use client";

import { useEffect, useState } from "react";
import { type FirestoreError, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { DEFAULT_CITY_ID } from "@/lib/constants";
import { itemsRef, roomsRef } from "@/lib/firebase/refs";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";

const PUBLIC_ROOM_CONSTRAINTS = [
  where("status", "==", "active"),
  where("cityId", "==", DEFAULT_CITY_ID),
  orderBy("createdAt", "desc"),
  limit(80),
] as const;

const PUBLIC_ITEM_CONSTRAINTS = [
  where("cityId", "==", DEFAULT_CITY_ID),
  where("status", "==", "active"),
  orderBy("createdAt", "desc"),
  limit(80),
] as const;

const LOCATION_AREA_MAP: Record<string, string[] | null> = {
  dharamshala: null,
  mcleodganj: ["McLeodganj", "Mcleodganj", "Bhagsu", "Temple Road", "Jogiwara Road", "Main Square"],
  sidhbari: ["Sidhbari", "Sidhpur", "Near University", "Temple Area", "New Colony", "Main Market"],
  "central-university": ["Central University", "University Gate", "Campus Road", "Student Colony", "Faculty Quarters"],
};

function toListingError(kind: "rooms" | "items", err: FirestoreError) {
  const summary = `[${kind}] Firestore query failed (${err.code}): ${err.message}`;
  console.error(summary);
  console.error(err);

  if (err.code === "permission-denied") {
    return kind === "rooms" ? "Unable to load rooms right now." : "Unable to load items right now.";
  }

  if (err.code === "failed-precondition") {
    return kind === "rooms"
      ? "Rooms are temporarily unavailable while the listing index is being set up."
      : "Items are temporarily unavailable while the listing index is being set up.";
  }

  return kind === "rooms" ? "Failed to load rooms." : "Failed to load items.";
}

export function useRooms() {
  const [rows, setRows] = useState<{ id: string; data: RoomListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(roomsRef(), ...PUBLIC_ROOM_CONSTRAINTS);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, data: d.data() as RoomListing }));
        setRows(next);
        setError(null);
      },
      (err) => {
        setRows([]);
        setError(toListingError("rooms", err));
      },
    );
    return () => unsub();
  }, []);

  return { rows: rows || [], loading: rows === null && !error, error };
}

export function useRoomsByLocation(location: string) {
  const [rows, setRows] = useState<{ id: string; data: RoomListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(roomsRef(), ...PUBLIC_ROOM_CONSTRAINTS);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const locationAreas = LOCATION_AREA_MAP[location] ?? [location.replace(/-/g, " ")];
        const normalizedAreas = locationAreas?.map((value) => value.trim().toLowerCase()) ?? null;
        const next = snap.docs
          .map((d) => ({ id: d.id, data: d.data() as RoomListing }))
          .filter(({ data }) => {
            if (!normalizedAreas) return true;

            const area = data.area?.trim().toLowerCase();
            const institution = data.institution?.trim().toLowerCase();

            return normalizedAreas.includes(area || '') || normalizedAreas.includes(institution || '');
          });
        setRows(next);
        setError(null);
      },
      (err) => {
        setRows([]);
        setError(toListingError("rooms", err));
      },
    );
    return () => unsub();
  }, [location]);

  return { rows: rows || [], loading: rows === null && !error, error };
}

export function useItems() {
  const [rows, setRows] = useState<{ id: string; data: ItemListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(itemsRef(), ...PUBLIC_ITEM_CONSTRAINTS);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, data: d.data() as ItemListing }));
        setRows(next);
        setError(null);
      },
      (err) => {
        setRows([]);
        setError(toListingError("items", err));
      },
    );
    return () => unsub();
  }, []);

  return { rows: rows || [], loading: rows === null && !error, error };
}
