"use client";

/**
 * ZodiacWheel - the twelve signs on a ring, coloured by element. One or two
 * signs are highlighted; with two, the aspect line between them is drawn and
 * named. The ring turns to bring the first highlighted sign to the top (no
 * turn under reduced motion). Each segment is a link to that sign's guide.
 *
 * Pure SVG + framer-motion; the static data comes from lib/aspects.ts and
 * lib/zodiac.ts, so it works without any request.
 */
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { aspectBetween, normalizeSign, SIGN_KEYS, type SignKey } from "@/lib/aspects";
import { ELEMENT_COLOR, SIGN_META } from "@/lib/zodiac";

const SIZE = 320;
const C = SIZE / 2;
const R_OUT = 150;
const R_IN = 94;
const R_GLYPH = (R_OUT + R_IN) / 2;
const R_LINE = R_IN - 6;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0 deg = top, clockwise
const pt = (r: number, deg: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });

function wedge(i: number) {
  const a0 = i * 30 + 1.2;
  const a1 = (i + 1) * 30 - 1.2;
  const o0 = pt(R_OUT, a0), o1 = pt(R_OUT, a1), i1 = pt(R_IN, a1), i0 = pt(R_IN, a0);
  return `M ${o0.x} ${o0.y} A ${R_OUT} ${R_OUT} 0 0 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${R_IN} ${R_IN} 0 0 0 ${i0.x} ${i0.y} Z`;
}

const label = (k: SignKey) => k.charAt(0).toUpperCase() + k.slice(1);

export default function ZodiacWheel({
  signs,
  className = "",
  showCaption = true,
}: {
  /** One or two signs ("Leo" or "leo"). Unknown names are ignored. */
  signs: string[];
  className?: string;
  /** The aspect name + meaning under the wheel. */
  showCaption?: boolean;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const picked = useMemo(
    () => signs.map(normalizeSign).filter((s): s is SignKey => !!s).slice(0, 2),
    [signs],
  );
  const [first, second] = picked;
  const aspect = first && second ? aspectBetween(first, second) : null;

  // Turn so the first highlighted sign's segment is centred at the top.
  const rotation = first ? -(SIGN_KEYS.indexOf(first) * 30 + 15) : 0;

  const a = first ? pt(R_LINE, SIGN_KEYS.indexOf(first) * 30 + 15) : null;
  const b = second ? pt(R_LINE, SIGN_KEYS.indexOf(second) * 30 + 15) : null;

  function open(k: SignKey) {
    router.push(`/blog/zodiac/${k}`);
  }

  const description = aspect
    ? `${label(first!)} and ${label(second!)}: ${aspect.name.toLowerCase()}, ${aspect.degrees} degrees. ${aspect.meaning}`
    : first
      ? `${label(first)} on the zodiac wheel.`
      : "The zodiac wheel.";

  return (
    <figure className={className} data-testid="zodiac-wheel" data-aspect={aspect?.name.toLowerCase() ?? ""}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label={description}
        className="w-full max-w-[20rem] mx-auto aspect-square"
      >
        <motion.g
          initial={{ rotate: reduced ? rotation : 0 }}
          animate={{ rotate: rotation }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${C}px ${C}px` }}
        >
          {SIGN_KEYS.map((k, i) => {
            const meta = SIGN_META[label(k)];
            const color = ELEMENT_COLOR[meta.element];
            const on = k === first || k === second;
            const g = pt(R_GLYPH, i * 30 + 15);
            return (
              <g
                key={k}
                role="link"
                tabIndex={0}
                aria-label={`${label(k)} (${meta.element}, ${meta.modality}). Open the ${label(k)} guide.`}
                aria-current={on ? "true" : undefined}
                onClick={() => open(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open(k);
                  }
                }}
                className="cursor-pointer outline-none group/seg"
                data-sign={k}
              >
                <path
                  d={wedge(i)}
                  fill={color}
                  fillOpacity={on ? 0.42 : 0.14}
                  stroke={on ? "var(--color-gold-bright)" : color}
                  strokeOpacity={on ? 1 : 0.35}
                  strokeWidth={on ? 2 : 1}
                  className="transition-[fill-opacity] duration-200 group-hover/seg:[fill-opacity:0.3] group-focus-visible/seg:[stroke:var(--color-gold-bright)] group-focus-visible/seg:[stroke-width:2.5]"
                />
                {/* Counter-turn the glyph so it stays upright while the ring rotates. */}
                <motion.g
                  initial={{ rotate: reduced ? -rotation : 0 }}
                  animate={{ rotate: -rotation }}
                  transition={reduced ? { duration: 0 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: `${g.x}px ${g.y}px` }}
                >
                  <g transform={`translate(${g.x - 11} ${g.y - 11})`} style={{ color: on ? "var(--color-ink)" : color }}>
                    <Glyph name={meta.glyph as GlyphName} size={22} strokeWidth={on ? 1.9 : 1.5} />
                  </g>
                </motion.g>
              </g>
            );
          })}

          {/* The aspect line between two highlighted signs. */}
          {a && b && aspect && (
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={aspect.tone === "harmonious" ? "var(--color-success)" : aspect.tone === "dynamic" ? "var(--color-warning)" : "var(--color-accent-bright)"}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={aspect.name === "Opposite" || aspect.name === "Square" ? undefined : "1 6"}
              data-testid="wheel-aspect-line"
              pointerEvents="none"
            />
          )}
        </motion.g>

        {/* Centre label (does not rotate). */}
        <text x={C} y={C - 4} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--color-ink)" pointerEvents="none">
          {aspect ? aspect.name : first ? label(first) : ""}
        </text>
        <text x={C} y={C + 16} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)" pointerEvents="none">
          {aspect ? `${aspect.degrees}°` : first ? `${SIGN_META[label(first)].element} · ${SIGN_META[label(first)].modality}` : ""}
        </text>
      </svg>

      {showCaption && aspect && (
        <figcaption className="mt-3 text-center text-sm text-ink-secondary leading-relaxed max-w-sm mx-auto">
          <span className="font-semibold text-ink">{label(first!)} and {label(second!)}: {aspect.name.toLowerCase()}.</span>{" "}
          {aspect.meaning}
        </figcaption>
      )}
    </figure>
  );
}
