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
  const activeCls = variant === "emerald" ? "bg-emerald-600" : "bg-blue-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
        active ? `${activeCls} text-white shadow-sm` : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
