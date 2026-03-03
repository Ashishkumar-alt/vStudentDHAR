import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "./client";

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export { serverTimestamp };
