import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { getDb } from "./db";

/**
 * Check if a user is an admin by looking up the admins collection
 * @param uid - User's Firebase Auth UID
 * @returns Promise<boolean> - True if user is admin
 */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const db = getDb();
    const adminDoc = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminDoc);
    
    if (adminSnap.exists()) {
      const adminData = adminSnap.data();
      console.log(' Admin check - User found in admins collection:', {
        uid,
        email: adminData?.email,
        role: adminData?.role
      });
      return adminData?.role === "admin";
    }
    
    console.log(' Admin check - User not found in admins collection:', { uid });
    return false;
  } catch (error) {
    console.error(' Admin check - Error checking admin status:', error);
    return false;
  }
}

/**
 * Watch admin status in real-time
 * @param uid - User's Firebase Auth UID
 * @param callback - Callback function with admin status
 * @returns Unsubscribe function
 */
export function watchIsAdmin(uid: string, callback: (isAdmin: boolean) => void, onError?: (error: Error) => void) {
  try {
    const db = getDb();
    const adminDoc = doc(db, "admins", uid);
    
    const unsubscribe = onSnapshot(adminDoc, (docSnap) => {
      if (docSnap.exists()) {
        const adminData = docSnap.data();
        const isAdmin = adminData?.role === "admin";
        console.log(' Admin watch - Status updated:', {
          uid,
          email: adminData?.email,
          role: adminData?.role,
          isAdmin
        });
        callback(isAdmin);
      } else {
        console.log(' Admin watch - User not in admins collection:', { uid });
        callback(false);
      }
    }, (error: any) => {
      console.error('🔐 Admin watch - Error:', error);
      if (onError) onError(error);
    });
    
    return unsubscribe;
  } catch (error: any) {
    console.error('🔐 Admin watch - Setup error:', error);
    if (onError) onError(error);
    return () => {};
  }
}
