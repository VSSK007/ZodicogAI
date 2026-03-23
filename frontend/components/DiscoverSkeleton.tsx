"use client";

/**
 * Pulsing skeleton loader for /discover result pages.
 * Mimics the shape of InsightCard + 3–5 prose cards below it.
 */
export default function DiscoverSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Tag pills */}
      <div className="flex gap-2">
        <div className="h-7 w-28 rounded-full bg-white/[0.06]" />
        <div className="h-7 w-16 rounded-full bg-white/[0.04]" />
        <div className="h-7 w-16 rounded-full bg-white/[0.04]" />
      </div>

      {/* InsightCard skeleton */}
      <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-5 space-y-4">
        <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-5 w-1/2 rounded bg-white/[0.04]" />
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-white/[0.04]" />
            <div className="h-3 w-10 rounded bg-white/[0.04]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-white/[0.04]" />
          <div className="h-6 w-16 rounded-full bg-white/[0.04]" />
        </div>
      </div>

      {/* Prose cards */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-3"
        >
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-white/[0.04]" />
            <div className="h-3.5 w-5/6 rounded bg-white/[0.04]" />
            <div className="h-3.5 w-4/6 rounded bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}
