"use client";

import { useRouter } from "next/navigation";
import { DHARAMSHALA_AREAS } from "@/lib/constants";

export default function AreaQuickChips() {
  const router = useRouter();

  function go(area: string) {
    try {
      window.localStorage.setItem("vstudent.area", area);
    } catch {}
    router.push("/rooms");
  }

  return (
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {DHARAMSHALA_AREAS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => go(a)}
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {a}
        </button>
      ))}
    </div>
  );
}
