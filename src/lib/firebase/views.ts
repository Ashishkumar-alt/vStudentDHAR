import { getCountFromServer, setDoc } from "firebase/firestore";
import { serverTimestamp } from "@/lib/firebase/db";
import { itemViewRef, itemViewsRef, roomViewRef, roomViewsRef } from "@/lib/firebase/refs";

export async function recordRoomView(input: { roomId: string; viewerId: string }) {
  await setDoc(
    roomViewRef(input.roomId, input.viewerId),
    { createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function recordItemView(input: { itemId: string; viewerId: string }) {
  await setDoc(
    itemViewRef(input.itemId, input.viewerId),
    { createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function getRoomViewsCount(roomId: string) {
  const snap = await getCountFromServer(roomViewsRef(roomId));
  return snap.data().count || 0;
}

export async function getItemViewsCount(itemId: string) {
  const snap = await getCountFromServer(itemViewsRef(itemId));
  return snap.data().count || 0;
}

