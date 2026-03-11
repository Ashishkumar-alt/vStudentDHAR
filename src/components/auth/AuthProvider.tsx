"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc, type FieldValue } from "firebase/firestore";
import { getDb, serverTimestamp } from "@/lib/firebase/db";
import type { UserProfile } from "@/lib/firebase/models";

type AuthState = {
  user: User | null;
  profile: (UserProfile & { id: string }) | null;
  profileComplete: boolean;
  loading: boolean;
  signOutNow: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<(UserProfile & { id: string }) | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    let profileUnsub: null | (() => void) = null;

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(true);
      try {
        if (profileUnsub) {
          profileUnsub();
          profileUnsub = null;
        }

        if (!u) {
          setProfile(null);
          setProfileComplete(false);
          return;
        }

        const db = getDb();
        const ref = doc(db, "users", u.uid);
        profileUnsub = onSnapshot(ref, async (snap) => {
          if (!snap.exists()) {
            // Create user profile with Google data if available
            const userData: any = {
              uid: u.uid,
              email: u.email || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            // Add Google-specific data if available
            if (u.displayName) {
              userData.name = u.displayName;
            }
            if (u.photoURL) {
              userData.photoUrl = u.photoURL;
            }

            await setDoc(ref, userData);
            setProfile({ ...userData, id: snap.id });
            setProfileComplete(false);
            return;
          }

          const data = snap.data() as UserProfile;
          setProfile({ ...(data as UserProfile), id: snap.id });
          
          // Check if profile is complete
          const userType = data?.userType;
          const institutionRequired = userType ? userType === "student" : true;
          const hasBasicInfo = Boolean(data?.name && data?.whatsappNumber);
          const hasInstitution = !institutionRequired || Boolean(data?.institution);
          
          setProfileComplete(hasBasicInfo && hasInstitution);
        });
      } finally {
        setLoading(false);
      }
    });
    return () => {
      if (profileUnsub) profileUnsub();
      unsub();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      profile,
      profileComplete,
      loading,
      signOutNow: async () => {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
      },
    }),
    [user, profile, profileComplete, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider/>");
  return ctx;
}

export async function updateProfileBasics(
  uid: string,
  input: {
    name: string;
    whatsappNumber: string;
    userType?: UserProfile["userType"];
    institution?: string | FieldValue;
    college?: string | FieldValue;
    photoUrl?: string;
  },
) {
  const ref = doc(getDb(), "users", uid);
  await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
}
