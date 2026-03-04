"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Favorite } from "@/lib/firebase/models";
import { removeFavorite, setFavorite, watchFavorites } from "@/lib/firebase/favorites";
import { useAuth } from "@/components/auth/AuthProvider";

type FavoritesState = {
  favorites: { id: string; data: Favorite }[];
  favoriteIds: Set<string>;
  loading: boolean;
  toggle: (input: { listingType: "room" | "item"; listingId: string }) => Promise<void>;
  isFavorite: (input: { listingType: "room" | "item"; listingId: string }) => boolean;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavoritesState] = useState<{ id: string; data: Favorite }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsub: null | (() => void) = null;
    const t = setTimeout(() => {
      if (!user) {
        setFavoritesState([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      unsub = watchFavorites(
        user.uid,
        (next) => {
          setFavoritesState(next);
          setLoading(false);
        },
        () => setLoading(false),
      );
    }, 0);

    return () => {
      clearTimeout(t);
      if (unsub) unsub();
    };
  }, [user]);

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const value = useMemo<FavoritesState>(
    () => ({
      favorites,
      favoriteIds,
      loading,
      toggle: async ({ listingType, listingId }) => {
        if (!user) throw new Error("Sign in to save.");
        const id = `${listingType}_${listingId}`;
        if (favoriteIds.has(id)) {
          await removeFavorite(user.uid, { listingType, listingId });
        } else {
          await setFavorite(user.uid, { listingType, listingId });
        }
      },
      isFavorite: ({ listingType, listingId }) => favoriteIds.has(`${listingType}_${listingId}`),
    }),
    [favorites, favoriteIds, loading, user],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider/>");
  return ctx;
}
