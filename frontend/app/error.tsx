"use client";

import { Star4 } from "@/components/ui/glyphs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <Star4 size={18} className="text-gold" />
      <p className="mt-5 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
        Something misaligned
      </p>
      <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink text-balance">
        A retrograde moment.
      </h1>
      <p className="mt-4 text-ink-secondary max-w-md">
        {error?.message || "Something went wrong on our side."} Trying again usually
        clears it.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center rounded-control px-7 py-3 min-h-[48px] text-sm font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200 tap-highlight-none"
      >
        Try again
      </button>
    </main>
  );
}
