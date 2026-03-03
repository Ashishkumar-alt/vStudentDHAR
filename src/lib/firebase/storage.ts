import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirebaseApp } from "./client";

export function getFirebaseStorage() {
  return getFirebaseStorageCandidates()[0] || getStorage(getFirebaseApp());
}

export function getFirebaseStorageCandidates(): FirebaseStorage[] {
  const app = getFirebaseApp();

  const fromEnv = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const fromApp = app.options.storageBucket;

  const buckets = new Set<string>();
  if (fromEnv) buckets.add(fromEnv);
  if (fromApp) buckets.add(fromApp);

  // Some projects use `<project>.appspot.com`, others use `<project>.firebasestorage.app`.
  // Try both as fallbacks to avoid confusing "uploads never finish" setups.
  for (const b of Array.from(buckets)) {
    if (b.endsWith(".firebasestorage.app")) buckets.add(b.replace(/\.firebasestorage\.app$/, ".appspot.com"));
    if (b.endsWith(".appspot.com")) buckets.add(b.replace(/\.appspot\.com$/, ".firebasestorage.app"));
  }

  return Array.from(buckets).map((b) => getStorage(app, `gs://${b}`));
}
