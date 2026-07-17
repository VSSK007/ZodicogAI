/**
 * AIHeader — the "AI is speaking" section header: pinging accent dot + label.
 * Replaces the per-page inline copies (which also carried the amber/blue
 * split-theme bug).
 */
export function AIHeader({ label = "AI Interpretation" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-2" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
        <div className="relative size-2 rounded-full bg-accent" />
      </div>
      <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">{label}</p>
    </div>
  );
}
