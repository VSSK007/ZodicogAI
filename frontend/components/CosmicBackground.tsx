/**
 * CosmicBackground — the single ambient layer behind every page.
 *
 * One recipe for all viewports (replaces the old desktop-violet / mobile-amber
 * split): a violet nebula crown, a faint gold horizon, a golden-angle star
 * field (a few stars glint gold), and drifting hand-drawn zodiac doodles.
 * Server component — pure markup, animated by CSS keyframes in globals.css.
 */

// ── Deterministic star field (golden-angle distribution) ─────────────────────
// Using the golden angle ratio (137.508°) to spread points without clustering.
const STARS = Array.from({ length: 100 }, (_, i) => {
  const x = ((i * 137.508 + 11.3) * 7.3) % 100;
  const y = ((i * 97.31 + 23.7) * 5.1) % 100;
  const size = i % 7 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.75;
  const opacity = 0.08 + (i % 9) * 0.042;
  const twinkleDur = 3 + (i % 8) * 1.5;
  const twinkleDelay = -(i % 11) * 1.3;
  const gold = i % 7 === 0;
  return { x, y, size, opacity, twinkleDur, twinkleDelay, gold };
});

// ── Floating doodles — omnidirectional ───────────────────────────────────────
// dir 0–5 maps to drift0–drift5 keyframes (6 different XY directions).
// All 12 zodiac glyphs + venus/mars/heart/star/crescent — hand-drawn paths
// shared with the UI glyph set (components/ui/glyphs.tsx).
const DOODLES: {
  path: string;
  x: number; y: number;
  size: number; dur: number; delay: number;
  rot: number; dir: number;
}[] = [
  // ♈ Aries ram horns
  { path: "M12 4 C8 4 4 8 4 12 M12 4 C16 4 20 8 20 12 M12 4 L12 20",
    x: 4,  y: 8,  size: 32, dur: 38, delay: 0,   rot: 8,   dir: 0 },
  // ♀ Venus
  { path: "M12 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 14v4M9 21h6",
    x: 88, y: 15, size: 28, dur: 45, delay: -12, rot: -5,  dir: 1 },
  // ♂ Mars
  { path: "M16 3l5 5-5 5M21 8H10a7 7 0 1 0 0 8",
    x: 20, y: 55, size: 28, dur: 42, delay: -8,  rot: 12,  dir: 2 },
  // ♡ Heart
  { path: "M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z",
    x: 72, y: 38, size: 30, dur: 50, delay: -20, rot: -10, dir: 3 },
  // ✦ 4-pointed star
  { path: "M12 2l1.5 8.5L22 12l-8.5 1.5L12 22l-1.5-8.5L2 12l8.5-1.5z",
    x: 15, y: 35, size: 22, dur: 55, delay: -30, rot: 15,  dir: 0 },
  // ☾ Crescent moon
  { path: "M20 12a8 8 0 1 1-8-8 6 6 0 0 0 8 8z",
    x: 80, y: 62, size: 30, dur: 44, delay: -18, rot: -12, dir: 1 },
  // ♒ Aquarius waves
  { path: "M3 8c3-3 6-3 9 0s6 3 9 0M3 16c3-3 6-3 9 0s6 3 9 0",
    x: 8,  y: 68, size: 28, dur: 57, delay: -40, rot: -3,  dir: 0 },
  // ♉ Taurus — circle + upward horns
  { path: "M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10M7 16C7 13 5 9 4 7M17 16C17 13 19 9 20 7",
    x: 35, y: 14, size: 28, dur: 47, delay: -7,  rot: -4, dir: 3 },
  // ♊ Gemini — twin pillars
  { path: "M8 4v16M16 4v16M8 4h8M8 20h8",
    x: 55, y: 5,  size: 26, dur: 43, delay: -16, rot: 6,  dir: 4 },
  // ♋ Cancer — 69 spirals
  { path: "M6 10a5 5 0 0 0 10 0M18 14a5 5 0 0 0-10 0M3 10a2 2 0 1 0 4 0M17 14a2 2 0 1 0 4 0",
    x: 75, y: 25, size: 28, dur: 51, delay: -28, rot: 10, dir: 5 },
  // ♌ Leo — circle with curled tail
  { path: "M8 12a5 5 0 1 1 10 0M18 12c2 3 2 7 0 9s-4 2-5 0",
    x: 90, y: 45, size: 26, dur: 44, delay: -9,  rot: -6, dir: 0 },
  // ♍ Virgo — M-form with loop
  { path: "M4 5v13M4 5c2-2 4-3 5-3s3 1.5 4 3 2.5-3 5-3M13 5v9a3.5 3.5 0 0 1-7 0",
    x: 82, y: 72, size: 28, dur: 58, delay: -33, rot: 3,  dir: 1 },
  // ♎ Libra — arch on a bar
  { path: "M3 17h18M8 17a4 4 0 0 1 8 0M3 20h18",
    x: 55, y: 92, size: 26, dur: 41, delay: -20, rot: -2, dir: 2 },
  // ♏ Scorpio — M with arrow stinger
  { path: "M4 8v8M4 8l4 4-4 4M8 8v8M8 8l4 4-4 4M12 8v8M16 12h5M19 10l2 2-2 2",
    x: 25, y: 78, size: 28, dur: 56, delay: -38, rot: 8,  dir: 3 },
  // ♐ Sagittarius — diagonal arrow
  { path: "M5 19L19 5M14 5h5v5",
    x: 12, y: 50, size: 26, dur: 39, delay: -13, rot: 0,  dir: 4 },
  // ♑ Capricorn — goat-fish glyph
  { path: "M4 8c0-3 2-6 5-6s5 3 5 6v8M14 10c1 4 4 8 7 10",
    x: 38, y: 42, size: 28, dur: 53, delay: -27, rot: 5,  dir: 5 },
  // ♓ Pisces — two arcs + connector
  { path: "M8 4c-3 4-3 12 0 16M16 4c3 4 3 12 0 16M5 12h14",
    x: 62, y: 65, size: 26, dur: 49, delay: -42, rot: -9, dir: 0 },
];

export default function CosmicBackground() {
  return (
    <>
      {/* ── Nebula — violet crown + faint gold horizon, all viewports ──────── */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 90% 55% at 50% -8%,  rgba(139,124,246,0.16) 0%, transparent 65%)",
            "radial-gradient(ellipse 70% 50% at 88% 15%,  rgba(169,155,255,0.07) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 45% at 8%  30%,  rgba(91, 28,182,0.10) 0%, transparent 60%)",
            "radial-gradient(ellipse 100% 40% at 50% 108%, rgba(216,166,60,0.08) 0%, transparent 65%)",
          ].join(", "),
        }}
      />

      {/* ── Star field ────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              backgroundColor: s.gold ? "#edcb7e" : "#e9e6f5",
              opacity: s.opacity,
              animation: `twinkle ${s.twinkleDur}s ease-in-out ${s.twinkleDelay}s infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Floating doodle symbols ───────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        {DOODLES.map((d, i) => (
          /* Outer: fixed position + static rotation */
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              transform: `rotate(${d.rot}deg)`,
            }}
          >
            {/* Inner: omnidirectional drift + fade */}
            <div
              style={{
                width: "100%",
                height: "100%",
                animation: `drift${d.dir} ${d.dur}s ease-in-out ${d.delay}s infinite`,
              }}
            >
              <svg
                width={d.size}
                height={d.size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={d.path} />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
