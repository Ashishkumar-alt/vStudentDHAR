"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc, type FieldValue } from "firebase/firestore";
import { getDb, serverTimestamp } from "@/lib/firebase/db";
import { watchIsAdmin } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/firebase/models";

type AuthState = {
  user: User | null;
  profile: (UserProfile & { id: string }) | null;
  profileComplete: boolean;
  loading: boolean;
  signOutNow: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<(UserProfile & { id: string }) | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  let profileUnsub: null | (() => void) = null;
  let adminUnsub: null | (() => void) = null;

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    console.log('🔐 AuthProvider: Setting up auth state listener');
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log('🔐 AuthProvider: Auth state changed', { 
        user: !!u, 
        email: u?.email, 
        uid: u?.uid,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      
      setUser(u);
      setAuthInitialized(true);
      setLoading(true);
      
      try {
        if (profileUnsub) {
          profileUnsub();
          profileUnsub = null;
        }

        if (!u) {
          console.log('🔐 AuthProvider: No user, clearing profile');
          setProfile(null);
          setProfileComplete(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Set up admin status watcher using Firestore admins collection
        const adminUnsub = watchIsAdmin(
          u.uid,
          (adminStatus) => {
            console.log('🔐 AuthProvider: Admin status from Firestore:', {
              uid: u.uid,
              email: u.email,
              isAdmin: adminStatus
            });
            setIsAdmin(adminStatus);
          },
          (error) => {
            console.error('🔐 AuthProvider: Admin status error:', error);
            setIsAdmin(false);
          }
        );

        const db = getDb();
        const ref = doc(db, "users", u.uid);
        console.log('🔐 AuthProvider: Setting up profile listener for', u.uid);
        
        profileUnsub = onSnapshot(ref, async (snap) => {
          console.log('🔐 AuthProvider: Profile snapshot received', { exists: snap.exists() });
          
          if (!snap.exists()) {
            // Create user profile if it doesn't exist
            const userData: any = {
              uid: u.uid,
              email: u.email || "",
              role: "user", // Default to user, admin status comes from admins collection
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            console.log('🔐 AuthProvider: Creating user profile with role:', userData.role);

            // Add Google-specific data if available
            if (u.displayName) {
              userData.name = u.displayName;
            }
            if (u.photoURL) {
              userData.photoUrl = u.photoURL;
            }

            await setDoc(ref, userData);
            setProfile({ ...userData, id: u.uid });
            setProfileComplete(false);
            setLoading(false);
            return;
          }

          const data = snap.data() as UserProfile;
          console.log('🔐 AuthProvider: User profile loaded', { role: data.role });
          setProfile({ ...(data as UserProfile), id: snap.id });
          
          // Check if profile is complete
          const userType = data?.userType;
          const institutionRequired = userType ? userType === "student" : true;
          const hasBasicInfo = Boolean(data?.name && data?.whatsappNumber);
          const hasInstitution = !institutionRequired || Boolean(data?.institution);
          
          setProfileComplete(hasBasicInfo && hasInstitution);
          setLoading(false);
        });
      } catch (error) {
        console.error('🔐 AuthProvider: Error in auth state change:', error);
        setLoading(false);
      }
    });
    
    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listeners');
      if (profileUnsub) profileUnsub();
      if (adminUnsub) adminUnsub();
      unsub();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => {
      // Multiple admin checks for reliability
      const profileAdmin = profile?.role === "admin";
      const emailAdmin = user?.email?.toLowerCase() === "vstudent343@gmail.com";
      const adminStatus = profileAdmin || emailAdmin;
      
      console.log('🔐 AuthProvider: Admin status calculated', { 
        profileRole: profile?.role, 
        userEmail: user?.email, 
        profileAdmin,
        emailAdmin,
        adminStatus,
        hasUser: !!user,
        hasProfile: !!profile
      });
      
      return {
        user,
        profile,
        profileComplete,
        loading,
        isAdmin: adminStatus,
        signOutNow: async () => {
          const auth = getFirebaseAuth();
          await firebaseSignOut(auth);
        },
      };
    },
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
