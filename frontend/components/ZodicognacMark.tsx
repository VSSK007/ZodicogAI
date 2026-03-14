/**
 * Zodicognac brand insignia — intimate counterpart to ZodicogMark.
 *
 * Same Z letterform (square linecaps = same brand family),
 * but framed in a rotated diamond instead of a circle.
 * Diamond reads as: jewel, private reserve, exclusive.
 * Rendered in amber/gold to reinforce the Zodicognac color identity.
 */
export default function ZodicognacMark({
  size = 20,
  className = "",
  active = false,
}: {
  size?: number;
  className?: string;
  active?: boolean;
}) {
  const color = active ? "#fbbf24" : "#d97706";
  const ringOpacity = active ? 0.55 : 0.4;
  const zOpacity = active ? 1 : 0.85;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Diamond frame — rotated square, jewel-like */}
      <path
        d="M14 1.5 L26.5 14 L14 26.5 L1.5 14 Z"
        stroke={color}
        strokeWidth="0.75"
        strokeOpacity={ringOpacity}
      />

      {/* Jewel facet — top corner accent */}
      <circle cx="14" cy="1.5" r="1.2" fill={color} fillOpacity={ringOpacity + 0.1} />

      {/* Z letterform — same construction as ZodicogMark for brand cohesion */}
      <path
        d="M8.5 10.5 H19.5 L8.5 17.5 H19.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeOpacity={zOpacity}
      />
    </svg>
  );
}
