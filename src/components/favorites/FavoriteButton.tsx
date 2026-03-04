"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/favorites/FavoritesProvider";

export default function FavoriteButton({
  listingType,
  listingId,
  className,
}: {
  listingType: "room" | "item";
  listingId: string;
  className?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = useMemo(() => isFavorite({ listingType, listingId }), [isFavorite, listingId, listingType]);

  async function onToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    setError(null);
    try {
      await toggle({ listingType, listingId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const title = saved ? "Unsave" : "Save";
  const cls = saved
    ? "bg-rose-600 text-white border-rose-700/20 hover:bg-rose-700"
    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={title}
        title={title}
        onClick={onToggle}
        disabled={busy}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${cls}`}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      </button>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

