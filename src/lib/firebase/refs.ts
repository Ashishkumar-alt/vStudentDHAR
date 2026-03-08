import { collection, doc } from "firebase/firestore";
import { getDb } from "./db";

export function usersRef() {
  return collection(getDb(), "users");
}

export function userRef(uid: string) {
  return doc(getDb(), "users", uid);
}

export function favoritesRef(uid: string) {
  return collection(getDb(), "users", uid, "favorites");
}

export function favoriteRef(uid: string, favoriteId: string) {
  return doc(getDb(), "users", uid, "favorites", favoriteId);
}

export function roomsRef() {
  return collection(getDb(), "rooms");
}

export function roomRef(id: string) {
  return doc(getDb(), "rooms", id);
}

export function roomViewsRef(roomId: string) {
  return collection(getDb(), "rooms", roomId, "views");
}

export function roomViewRef(roomId: string, viewerId: string) {
  return doc(getDb(), "rooms", roomId, "views", viewerId);
}

export function itemsRef() {
  return collection(getDb(), "items");
}

export function itemRef(id: string) {
  return doc(getDb(), "items", id);
}

export function itemViewsRef(itemId: string) {
  return collection(getDb(), "items", itemId, "views");
}

export function itemViewRef(itemId: string, viewerId: string) {
  return doc(getDb(), "items", itemId, "views", viewerId);
}

export function reportsRef() {
  return collection(getDb(), "reports");
}

export function adminsRef() {
  return collection(getDb(), "admins");
}

export function adminRef(uid: string) {
  return doc(getDb(), "admins", uid);
}

export function adminLogsRef() {
  return collection(getDb(), "admin_logs");
}

export function adminLogRef(id: string) {
  return doc(getDb(), "admin_logs", id);
}
