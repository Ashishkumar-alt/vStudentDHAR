"use client";

import { DHARAMSHALA_AREAS } from "@/lib/constants";

export default function AreaChips({
  value,
  onChange,
  className,
  variant = "blue",
}: {
  value: string;
  onChange: (area: string) => void;
  className?: string;
  variant?: "blue" | "emerald";
}) {
  return (
    <div className={className || ""}>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip variant={variant} active={value === ""} onClick={() => onChange("")}>
          All areas
        </Chip>
        {DHARAMSHALA_AREAS.map((a) => (
          <Chip variant={variant} key={a} active={value === a} onClick={() => onChange(a)}>
            {a}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  variant,
  children,
}: {
  active: boolean;
  onClick: () => void;
  variant: "blue" | "emerald";
  children: React.ReactNode;
}) {
  const activeCls =
    variant === "emerald"
      ? "bg-gradient-to-r from-emerald-600 to-teal-600"
      : "bg-gradient-to-r from-blue-600 to-indigo-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "focus-ring shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? `${activeCls} text-white shadow-sm ring-1 ring-white/15`
          : "bg-[color:var(--card)] text-[color:var(--foreground)] ring-1 ring-[color:var(--border)] hover:bg-[color:color-mix(in srgb, var(--card) 82%, transparent)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
