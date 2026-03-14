import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirebaseApp } from "./client";

let authInstance: any = null;
let persistenceSet = false;

export function getFirebaseAuth() {
  if (authInstance) return authInstance;
  
  const app = getFirebaseApp();
  authInstance = getAuth(app);
  
  // Enable browser local persistence for better mobile experience
  if (typeof window !== 'undefined' && !persistenceSet) {
    persistenceSet = true;
    // Set persistence before any auth operations
    authInstance.setPersistence(browserLocalPersistence)
      .then(() => {
        console.log('✅ Firebase auth persistence enabled successfully');
      })
      .catch((error: any) => {
        console.warn('⚠️ Firebase auth persistence setup failed:', error);
        // Continue anyway - auth will work but may not persist
      });
  }
  
  return authInstance;
}

// Force re-initialize auth (useful for debugging)
export function resetAuth() {
  authInstance = null;
  persistenceSet = false;
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function resetPassword(email: string) {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle(token: string) {
  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(token);
  const cred = await signInWithCredential(auth, credential);
  return cred.user;
}

export async function signOut() {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

