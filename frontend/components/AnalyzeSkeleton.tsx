"use client";

/**
 * Pulsing skeleton loader for /analyze result pages.
 * variant="pair"  — score ring + metrics + radar + AI text (emotional, romantic, etc.)
 * variant="solo"  — text cards only (hybrid, zodiac, color, numerology)
 */
export default function AnalyzeSkeleton({ variant = "pair" }: { variant?: "pair" | "solo" }) {
  return (
    <div className="space-y-4 md:space-y-5 animate-pulse">

      {variant === "pair" && (
        <>
          {/* Score ring */}
          <div className="bg-white/[0.03] ring-1 ring-white/10 rounded-2xl p-5 md:p-8 flex justify-center">
            <div className="w-[180px] h-[180px] rounded-full bg-white/[0.05] ring-4 ring-white/[0.04]" />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/[0.03] ring-1 ring-white/10 rounded-2xl p-4 space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
                <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>

          {/* Radar / chart placeholder */}
          <div className="bg-white/[0.03] ring-1 ring-white/10 rounded-2xl p-4 md:p-6 space-y-3">
            <div className="h-3 w-28 rounded bg-white/[0.06]" />
            <div className="h-[220px] md:h-[300px] rounded-xl bg-white/[0.03]" />
          </div>
        </>
      )}

      {/* AI interpretation / text card — shown for both variants */}
      <div className="bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-2 h-2 rounded-full bg-white/[0.08]" />
          <div className="h-3 w-28 rounded bg-white/[0.06]" />
          <div className="ml-auto h-5 w-24 rounded-full bg-white/[0.04]" />
        </div>

        {/* Text rows */}
        <div className="p-4 md:p-6 space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-l-2 border-white/[0.06] pl-4 space-y-2">
              <div className="h-2.5 w-32 rounded bg-white/[0.06]" />
              <div className="h-3.5 w-full rounded bg-white/[0.04]" />
              <div className="h-3.5 w-5/6 rounded bg-white/[0.04]" />
              <div className="h-3.5 w-4/6 rounded bg-white/[0.03]" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
