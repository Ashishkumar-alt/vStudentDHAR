import { onSnapshot } from "firebase/firestore";
import { adminRef } from "./refs";

export function watchIsAdmin(uid: string, onValue: (isAdmin: boolean) => void, onError?: (e: Error) => void) {
  return onSnapshot(
    adminRef(uid),
    (snap) => onValue(snap.exists()),
    (err) => onError?.(err as Error),
  );
}
