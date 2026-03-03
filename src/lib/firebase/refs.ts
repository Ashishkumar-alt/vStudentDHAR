import { collection, doc } from "firebase/firestore";
import { getDb } from "./db";

export function usersRef() {
  return collection(getDb(), "users");
}

export function userRef(uid: string) {
  return doc(getDb(), "users", uid);
}

export function roomsRef() {
  return collection(getDb(), "rooms");
}

export function roomRef(id: string) {
  return doc(getDb(), "rooms", id);
}

export function itemsRef() {
  return collection(getDb(), "items");
}

export function itemRef(id: string) {
  return doc(getDb(), "items", id);
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
