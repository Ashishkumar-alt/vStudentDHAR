import { addDoc, deleteDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { itemsRef, itemRef, roomRef, roomsRef } from "./refs";
import type { ItemListing, RoomListing } from "./models";
import { logAdminAction } from "./admin-logs";
import { validateListingCreation } from "./anti-spam";
import { uploadImageToCloudinary } from "@/lib/cloudinary/client";

export async function createRoom(input: Omit<RoomListing, "createdAt" | "updatedAt" | "status">, photos: File[]) {
  // Validate user hasn't exceeded daily listing limit
  await validateListingCreation(input.createdBy);

  const docRef = await addDoc(roomsRef(), {
    ...input,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const urls = await uploadListingPhotos({ type: "room", id: docRef.id }, photos);
  if (urls.length) {
    await updateDoc(docRef, { photoUrls: urls, updatedAt: serverTimestamp() });
  }
  return docRef.id;
}

export async function createItem(input: Omit<ItemListing, "createdAt" | "updatedAt" | "status">, photos: File[]) {
  // Validate user hasn't exceeded daily listing limit
  await validateListingCreation(input.createdBy);

  const docRef = await addDoc(itemsRef(), {
    ...input,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const urls = await uploadListingPhotos({ type: "item", id: docRef.id }, photos);
  if (urls.length) {
    await updateDoc(docRef, { photoUrls: urls, updatedAt: serverTimestamp() });
  }
  return docRef.id;
}

export async function updateRoom(
  id: string,
  input: Partial<Omit<RoomListing, "createdAt" | "updatedAt" | "createdBy" | "type" | "status">>,
  opts?: { newPhotos?: File[]; replacePhotos?: boolean },
) {
  const next: Record<string, unknown> = { ...input, updatedAt: serverTimestamp() };

  if (opts?.newPhotos?.length) {
    const urls = await uploadListingPhotos({ type: "room", id }, opts.newPhotos);
    if (opts.replacePhotos) {
      next.photoUrls = urls;
    } else {
      const existing = await getRoom(id);
      next.photoUrls = [...(existing?.data.photoUrls || []), ...urls];
    }
  }

  await updateDoc(roomRef(id), next);
}

export async function updateItem(
  id: string,
  input: Partial<Omit<ItemListing, "createdAt" | "updatedAt" | "createdBy" | "type" | "status">>,
  opts?: { newPhotos?: File[]; replacePhotos?: boolean },
) {
  const next: Record<string, unknown> = { ...input, updatedAt: serverTimestamp() };

  if (opts?.newPhotos?.length) {
    const urls = await uploadListingPhotos({ type: "item", id }, opts.newPhotos);
    if (opts.replacePhotos) {
      next.photoUrls = urls;
    } else {
      const existing = await getItem(id);
      next.photoUrls = [...(existing?.data.photoUrls || []), ...urls];
    }
  }

  await updateDoc(itemRef(id), next);
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

// Moderation functions
export async function approveRoom(id: string, approvedBy: string, adminEmail: string) {
  // Get room details for logging
  const roomDoc = await getDoc(roomRef(id));
  const roomData = roomDoc.data() as RoomListing;
  
  await updateDoc(roomRef(id), { 
    status: "active",
    approvedAt: serverTimestamp(),
    approvedBy,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: approvedBy,
    adminEmail,
    action: "approve",
    targetType: "room",
    targetId: id,
    targetTitle: roomData?.title,
  });
}

export async function rejectRoom(id: string, rejectedBy: string, adminEmail: string, reason?: string) {
  // Get room details for logging
  const roomDoc = await getDoc(roomRef(id));
  const roomData = roomDoc.data() as RoomListing;
  
  await updateDoc(roomRef(id), { 
    status: "rejected", 
    rejectedAt: serverTimestamp(),
    rejectedBy,
    rejectionReason: reason,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: rejectedBy,
    adminEmail,
    action: "reject",
    targetType: "room",
    targetId: id,
    targetTitle: roomData?.title,
    reason,
  });
}

export async function softDeleteRoom(id: string, deletedBy: string, adminEmail: string, reason?: string) {
  // Get room details for logging
  const roomDoc = await getDoc(roomRef(id));
  const roomData = roomDoc.data() as RoomListing;
  
  await updateDoc(roomRef(id), { 
    status: "deleted", 
    deletedAt: serverTimestamp(),
    deletedBy,
    deletionReason: reason,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: deletedBy,
    adminEmail,
    action: "soft_delete",
    targetType: "room",
    targetId: id,
    targetTitle: roomData?.title,
    reason,
  });
}

export async function approveItem(id: string, approvedBy: string, adminEmail: string) {
  // Get item details for logging
  const itemDoc = await getDoc(itemRef(id));
  const itemData = itemDoc.data() as ItemListing;
  
  await updateDoc(itemRef(id), { 
    status: "active",
    approvedAt: serverTimestamp(),
    approvedBy,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: approvedBy,
    adminEmail,
    action: "approve",
    targetType: "item",
    targetId: id,
    targetTitle: itemData?.title,
  });
}

export async function rejectItem(id: string, rejectedBy: string, adminEmail: string, reason?: string) {
  // Get item details for logging
  const itemDoc = await getDoc(itemRef(id));
  const itemData = itemDoc.data() as ItemListing;
  
  await updateDoc(itemRef(id), { 
    status: "rejected", 
    rejectedAt: serverTimestamp(),
    rejectedBy,
    rejectionReason: reason,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: rejectedBy,
    adminEmail,
    action: "reject",
    targetType: "item",
    targetId: id,
    targetTitle: itemData?.title,
    reason,
  });
}

export async function softDeleteItem(id: string, deletedBy: string, adminEmail: string, reason?: string) {
  // Get item details for logging
  const itemDoc = await getDoc(itemRef(id));
  const itemData = itemDoc.data() as ItemListing;
  
  await updateDoc(itemRef(id), { 
    status: "deleted", 
    deletedAt: serverTimestamp(),
    deletedBy,
    deletionReason: reason,
    updatedAt: serverTimestamp() 
  });
  
  // Log admin action
  await logAdminAction({
    adminId: deletedBy,
    adminEmail,
    action: "soft_delete",
    targetType: "item",
    targetId: id,
    targetTitle: itemData?.title,
    reason,
  });
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
