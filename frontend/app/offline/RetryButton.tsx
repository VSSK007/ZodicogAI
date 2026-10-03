"use client";

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-8 inline-flex items-center justify-center rounded-control px-7 py-3 min-h-[48px] text-sm font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200 tap-highlight-none"
    >
      Try again
    </button>
  );
}
