"use client";

export function Skeleton({ className }: { className?: string }) {
  return <div className={["skeleton animate-pulse rounded-xl", className || ""].join(" ")} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={i === 0 ? "h-4 w-3/4" : "h-3 w-2/3"} />
        ))}
      </div>
    </div>
  );
}

