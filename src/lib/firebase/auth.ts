import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
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

