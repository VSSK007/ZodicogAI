/**
 * CosmicBackground — the single ambient layer behind every page.
 *
 * One recipe for all viewports: a violet nebula crown and faint gold horizon
 * (a single gradient element), plus a golden-angle star field and drifting
 * hand-drawn zodiac doodles, both drawn on one canvas (StarCanvas).
 * Server component; only the canvas is client-side.
 */

import StarCanvas from "@/components/StarCanvas";

export default function CosmicBackground() {
  return (
    <>
      {/* ── Nebula — violet crown + faint gold horizon, all viewports ──────── */}
      <div
        className="cosmic-layer fixed inset-x-0 top-0 h-lvh -z-20 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 90% 55% at 50% -8%,  rgba(139,124,246,0.16) 0%, transparent 65%)",
            "radial-gradient(ellipse 70% 50% at 88% 15%,  rgba(169,155,255,0.07) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 45% at 8%  30%,  rgba(91, 28,182,0.10) 0%, transparent 60%)",
            "radial-gradient(ellipse 100% 40% at 50% 108%, rgba(216,166,60,0.08) 0%, transparent 65%)",
          ].join(", "),
        }}
      />

      {/* Stars + drifting zodiac doodles: one canvas, not ~120 DOM nodes */}
      <StarCanvas />
    </>
  );
}
