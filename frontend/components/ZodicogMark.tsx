/**
 * ZodicogAI brand insignia — a circular seal with:
 *   · Thin outer ring (like a signet/coin)
 *   · Crown jewel dot at 12 o'clock
 *   · Architectural Z letterform (square linecaps, precise geometry)
 * Scales cleanly from 16px (navbar) to 72px (hero).
 */
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
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Outer ring */}
      <circle
        cx="14" cy="14" r="12.5"
        stroke="white"
        strokeWidth="0.75"
        strokeOpacity="0.35"
      />

      {/* Crown jewel — sits at the topmost point of the ring */}
      <circle cx="14" cy="1.5" r="1.25" fill="white" fillOpacity="0.45" />

      {/* Z letterform — square linecaps give architectural, not typographic, feel */}
      <path
        d="M7.5 10.5 H20.5 L7.5 17.5 H20.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
