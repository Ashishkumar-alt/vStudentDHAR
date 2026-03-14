import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./db";

/**
 * Set admin role for a user in Firestore
 * This should be used to grant admin privileges to specific users
 */
export async function setAdminRole(uid: string, email: string) {
  try {
    const db = getDb();
    const userDoc = doc(db, "users", uid);
    
    // Check if user document exists
    const userSnap = await getDoc(userDoc);
    
    if (userSnap.exists()) {
      // Update existing document
      await setDoc(userDoc, {
        role: "admin",
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log(`✅ Admin role granted to ${email}`);
    } else {
      // Create new document with admin role
      await setDoc(userDoc, {
        uid,
        email,
        role: "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Admin user document created for ${email}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error setting admin role:", error);
    return false;
  }
}

/**
 * Check if a user has admin role in Firestore
 */
export async function checkAdminRole(uid: string): Promise<boolean> {
  try {
    const db = getDb();
    const userDoc = doc(db, "users", uid);
    const userSnap = await getDoc(userDoc);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === "admin";
    }
    
    return false;
  } catch (error) {
    console.error("❌ Error checking admin role:", error);
    return false;
  }
}

/**
 * Remove admin role from a user
 */
export async function removeAdminRole(uid: string) {
  try {
    const db = getDb();
    const userDoc = doc(db, "users", uid);
    
    await setDoc(userDoc, {
      role: "user",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log(`✅ Admin role removed from user ${uid}`);
    return true;
  } catch (error) {
    console.error("❌ Error removing admin role:", error);
    return false;
  }
}
