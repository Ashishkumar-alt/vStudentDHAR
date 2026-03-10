"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroLocationSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit() {
    const value = query.trim();
    router.push(value ? `/rooms?q=${encodeURIComponent(value)}` : "/rooms");
  }

  return (
    <div className="mt-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
        <input
          className="focus-ring h-11 w-full rounded-full border border-white/20 bg-white/12 pl-11 pr-4 text-sm text-white placeholder:text-white/65 backdrop-blur"
          placeholder="Search area or college"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </label>
      <button
        type="button"
        className="btn h-11 shrink-0 bg-white text-slate-900 hover:bg-white/90"
        onClick={submit}
      >
        Search
      </button>
    </div>
  );
}
