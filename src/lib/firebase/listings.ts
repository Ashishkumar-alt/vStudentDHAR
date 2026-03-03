import { addDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { compressForUpload } from "@/lib/images";
import { serverTimestamp } from "@/lib/firebase/db";
import { getFirebaseStorageCandidates } from "@/lib/firebase/storage";
import { itemRef, itemsRef, roomRef, roomsRef } from "@/lib/firebase/refs";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";

export async function createRoom(input: Omit<RoomListing, "createdAt" | "updatedAt">, photos: File[]) {
  const docRef = await addDoc(roomsRef(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const urls = await uploadListingPhotos({ type: "room", id: docRef.id }, photos);
  if (urls.length) {
    await updateDoc(docRef, { photoUrls: urls, updatedAt: serverTimestamp() });
  }
  return docRef.id;
}

export async function createItem(input: Omit<ItemListing, "createdAt" | "updatedAt">, photos: File[]) {
  const docRef = await addDoc(itemsRef(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const urls = await uploadListingPhotos({ type: "item", id: docRef.id }, photos);
  if (urls.length) {
    await updateDoc(docRef, { photoUrls: urls, updatedAt: serverTimestamp() });
  }
  return docRef.id;
}

async function uploadListingPhotos(
  listing: { type: "room" | "item"; id: string },
  photos: File[],
) {
  const storages = getFirebaseStorageCandidates();

  const withTimeout = async <T,>(p: Promise<T>, ms: number, msg: string) => {
    let t: ReturnType<typeof setTimeout> | null = null;
    try {
      return await Promise.race([
        p,
        new Promise<T>((_, reject) => {
          t = setTimeout(() => reject(new Error(msg)), ms);
        }),
      ]);
    } finally {
      if (t) clearTimeout(t);
    }
  };

  const uploads = photos.map(async (file, idx) => {
    const fileToUpload =
      file.size <= 700 * 1024
        ? file
        : await withTimeout(
            compressForUpload(file, { maxMB: 0.8, maxSize: 1600 }),
            20000,
            "Photo processing took too long. Try smaller photos.",
          );

    let lastErr: unknown = null;

    for (const storage of storages) {
      try {
        const objectRef = ref(storage, `listings/${listing.type}/${listing.id}/${idx + 1}.jpg`);
        await withTimeout(
          uploadBytes(objectRef, fileToUpload, { contentType: fileToUpload.type || "image/jpeg" }),
          30000,
          "Photo upload timed out. Check your internet and try again.",
        );
        return await withTimeout(
          getDownloadURL(objectRef),
          10000,
          "Could not fetch photo URL. Try again.",
        );
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr instanceof Error
      ? lastErr
      : new Error(
          "Photo upload failed. Check Firebase Storage is enabled and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct.",
        );
  });
  return Promise.all(uploads);
}

export async function markRoomSold(id: string) {
  await updateDoc(roomRef(id), { status: "sold", updatedAt: serverTimestamp() });
}

export async function markItemSold(id: string) {
  await updateDoc(itemRef(id), { status: "sold", updatedAt: serverTimestamp() });
}

export async function deleteRoom(id: string) {
  await deleteDoc(roomRef(id));
}

export async function deleteItem(id: string) {
  await deleteDoc(itemRef(id));
}

export async function setRoomApproved(id: string, approved: boolean) {
  await updateDoc(roomRef(id), { approved, updatedAt: serverTimestamp() });
}

export async function setItemApproved(id: string, approved: boolean) {
  await updateDoc(itemRef(id), { approved, updatedAt: serverTimestamp() });
}

export async function getRoom(id: string) {
  const snap = await getDoc(roomRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, data: snap.data() as RoomListing };
}

export async function getItem(id: string) {
  const snap = await getDoc(itemRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, data: snap.data() as ItemListing };
}
