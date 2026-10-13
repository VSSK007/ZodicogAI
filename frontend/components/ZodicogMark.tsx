/**
 * ZodicogAI brand insignia — a circular seal with:
 *   · Thin outer ring (like a signet/coin)
 *   · Crown jewel dot at 12 o'clock
 *   · Architectural Z letterform (square linecaps, precise geometry)
 * Scales cleanly from 16px (navbar) to 72px (hero).
 *
 * MARK is the single source of the geometry: the PWA home-screen icon
 * (lib/pwaIcon.tsx) and the favicon (app/icon.svg) are drawn from the same
 * numbers, so the logo can't drift between the site and the installed app.
 */
export const MARK = {
  size: 28,
  ring: { cx: 14, cy: 14, r: 12.5, strokeWidth: 0.75, opacity: 0.35 },
  jewel: { cx: 14, cy: 1.5, r: 1.25, opacity: 0.45 },
  z: { d: "M7.5 10.5 H20.5 L7.5 17.5 H20.5", strokeWidth: 2 },
} as const;

export default function ZodicogMark({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK.size} ${MARK.size}`}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Outer ring */}
      <circle
        cx={MARK.ring.cx} cy={MARK.ring.cy} r={MARK.ring.r}
        stroke="white"
        strokeWidth={MARK.ring.strokeWidth}
        strokeOpacity={MARK.ring.opacity}
      />

      {/* Crown jewel — sits at the topmost point of the ring */}
      <circle cx={MARK.jewel.cx} cy={MARK.jewel.cy} r={MARK.jewel.r} fill="white" fillOpacity={MARK.jewel.opacity} />

      {/* Z letterform — square linecaps give architectural, not typographic, feel */}
      <path
        d={MARK.z.d}
        stroke="white"
        strokeWidth={MARK.z.strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
