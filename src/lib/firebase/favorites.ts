import { deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import { serverTimestamp } from "@/lib/firebase/db";
import { favoriteRef, favoritesRef } from "@/lib/firebase/refs";
import type { Favorite } from "@/lib/firebase/models";

export function favoriteId(listingType: "room" | "item", listingId: string) {
  return `${listingType}_${listingId}`;
}

export async function setFavorite(uid: string, input: { listingType: "room" | "item"; listingId: string }) {
  const id = favoriteId(input.listingType, input.listingId);
  await setDoc(favoriteRef(uid, id), {
    listingType: input.listingType,
    listingId: input.listingId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid: string, input: { listingType: "room" | "item"; listingId: string }) {
  const id = favoriteId(input.listingType, input.listingId);
  await deleteDoc(favoriteRef(uid, id));
}

export function watchFavorites(
  uid: string,
  onValue: (favorites: { id: string; data: Favorite }[]) => void,
  onError?: (e: Error) => void,
) {
  return onSnapshot(
    favoritesRef(uid),
    (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, data: d.data() as Favorite }));
      onValue(next);
    },
    (e) => onError?.(e as Error),
  );
}

