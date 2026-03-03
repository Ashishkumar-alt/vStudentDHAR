"use client";

import { useEffect, useState } from "react";
import { limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { DEFAULT_CITY_ID } from "@/lib/constants";
import { itemsRef, roomsRef } from "@/lib/firebase/refs";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";

export function useRooms() {
  const [rows, setRows] = useState<{ id: string; data: RoomListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      roomsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
      where("approved", "==", true),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(80),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, data: d.data() as RoomListing }));
        setRows(next);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load rooms");
      },
    );
    return () => unsub();
  }, []);

  return { rows: rows || [], loading: rows === null && !error, error };
}

export function useItems() {
  const [rows, setRows] = useState<{ id: string; data: ItemListing }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      itemsRef(),
      where("cityId", "==", DEFAULT_CITY_ID),
      where("approved", "==", true),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(80),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, data: d.data() as ItemListing }));
        setRows(next);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load items");
      },
    );
    return () => unsub();
  }, []);

  return { rows: rows || [], loading: rows === null && !error, error };
}
