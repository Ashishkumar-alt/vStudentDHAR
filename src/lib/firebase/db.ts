import { getFirestore, initializeFirestore, serverTimestamp, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./client";

let db: Firestore | null = null;

export function getDb() {
  if (db) return db;

  const app = getFirebaseApp();
  // Allow optional fields (e.g. `institution`, `college`, `walkMinutesToHPU`) to be omitted by passing `undefined`.
  // Without this, Firestore throws "Unsupported field value: undefined" on `addDoc`/`updateDoc`.
  try {
    db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    // In dev/hot-reload, Firestore may already be initialized for this app.
    db = getFirestore(app);
  }
  return db;
}

export { serverTimestamp };
