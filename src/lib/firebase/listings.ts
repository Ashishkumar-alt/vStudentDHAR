import { addDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { serverTimestamp } from "@/lib/firebase/db";
import { itemRef, itemsRef, roomRef, roomsRef } from "@/lib/firebase/refs";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";
import { uploadImageToCloudinary } from "@/lib/cloudinary/client";

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
  const uploads = photos.map(async (file, idx) => {
    return uploadImageToCloudinary({
      file,
      folder: `vstudent/listings/${listing.type}/${listing.id}`,
      publicId: `vstudent/listings/${listing.type}/${listing.id}/${idx + 1}`,
      overwrite: false,
      maxSize: 800,
      maxMB: 0.7,
    });
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
