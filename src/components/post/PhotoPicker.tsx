"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

export default function PhotoPicker({
  max,
  value,
  onChange,
}: {
  max: number;
  value: File[];
  onChange: (files: File[]) => void;
}) {
  const previews = useMemo(() => value.map((f) => URL.createObjectURL(f)), [value]);

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const remaining = useMemo(() => Math.max(0, max - value.length), [max, value.length]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium">Photos</label>
        <span className="text-xs text-zinc-500">
          {value.length}/{max}
        </span>
      </div>

      <input
        className="mt-2 block w-full text-sm"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const next = [...value, ...files].slice(0, max);
          onChange(next);
          e.currentTarget.value = "";
        }}
        disabled={remaining === 0}
      />

      {previews.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, idx) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
              <Image src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
