/**
 * Sigil — renders the deterministic constellation seal for a seed.
 * Pure SVG with no hooks or CSS variables, so it also works inside
 * next/og ImageResponse (OG cards) as well as in the page.
 */
import { SIGIL_PALETTE, sigilFor, type SigilPalette } from "@/lib/sigil";

export default function Sigil({
  seed,
  size = 48,
  palette = SIGIL_PALETTE,
  className,
}: {
  seed: string;
  size?: number;
  palette?: SigilPalette;
  className?: string;
}) {
  const g = sigilFor(seed);
  const S = 100;
  const c = S / 2;
  const R = 46; // unit radius in svg space
  const X = (v: number) => c + v * R;
  const Y = (v: number) => c + v * R;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      role="img"
      aria-label="Reading sigil"
    >
      <circle cx={c} cy={c} r={g.ringRadius * R} fill="none" stroke={palette.ring} strokeOpacity={0.45} strokeWidth={0.8} />
      {g.ticks.map((t, i) => {
        const r1 = g.ringRadius * R;
        const r2 = r1 + R * (t.lit ? 0.09 : 0.045);
        return (
          <line
            key={i}
            x1={c + Math.cos(t.angle) * r1} y1={c + Math.sin(t.angle) * r1}
            x2={c + Math.cos(t.angle) * r2} y2={c + Math.sin(t.angle) * r2}
            stroke={palette.ring} strokeOpacity={t.lit ? 0.9 : 0.35} strokeWidth={0.8} strokeLinecap="round"
          />
        );
      })}
      {g.edges.map(([a, b], i) => (
        <line
          key={i}
          x1={X(g.stars[a].x)} y1={Y(g.stars[a].y)}
          x2={X(g.stars[b].x)} y2={Y(g.stars[b].y)}
          stroke={palette.line} strokeOpacity={0.8} strokeWidth={0.9} strokeLinecap="round"
        />
      ))}
      {g.stars.map((s, i) => (
        <g key={i}>
          {s.anchor && <circle cx={X(s.x)} cy={Y(s.y)} r={s.r * R * 2.4} fill={palette.anchor} fillOpacity={0.25} />}
          <circle cx={X(s.x)} cy={Y(s.y)} r={s.r * R} fill={s.anchor ? palette.anchor : palette.star} />
        </g>
      ))}
    </svg>
  );
}
