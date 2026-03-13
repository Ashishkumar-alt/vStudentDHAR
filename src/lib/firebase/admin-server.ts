import * as admin from "firebase-admin";

// Firebase Admin SDK configuration
let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for production deployment on Vercel
 */
export function getFirebaseAdminApp(): admin.app.App {
  if (adminApp) return adminApp;

  // Use environment variables for all environments (development and production)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.");
  }
  
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, "vstudent-admin");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error;
  }

  return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAdminAuth(): admin.auth.Auth {
  if (!adminAuth) {
    adminAuth = admin.auth(getFirebaseAdminApp());
  }
  return adminAuth;
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getFirebaseAdminFirestore(): admin.firestore.Firestore {
  if (!adminDb) {
    adminDb = admin.firestore(getFirebaseAdminApp());
  }
  return adminDb;
}

/**
 * Verify Firebase ID token and return decoded token
 */
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getFirebaseAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token");
  }
}

/**
 * Check if user is admin by verifying their role in Firestore
 */
export async function verifyAdminRole(uid: string): Promise<boolean> {
  try {
    const db = getFirebaseAdminFirestore();
    const adminDoc = await db.collection("admins").doc(uid).get();
    return adminDoc.exists;
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return false;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string) {
  try {
    const db = getFirebaseAdminFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Create admin user (for initial setup)
 */
export async function createAdminUser(uid: string, email: string) {
  try {
    const db = getFirebaseAdminFirestore();
    await db.collection("admins").doc(uid).set({
      uid,
      email,
      role: "admin",
      createdAt: new Date(),
      createdBy: "system",
    });
    
    // Also update user profile with admin role
    await db.collection("users").doc(uid).update({
      role: "admin",
      updatedAt: new Date(),
    });
    
    return true;
  } catch (error) {
    console.error("Error creating admin user:", error);
    return false;
  }
}
