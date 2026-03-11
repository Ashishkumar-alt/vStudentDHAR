import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseApp } from "./client";

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
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

