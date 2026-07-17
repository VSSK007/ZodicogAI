/**
 * Brand glyph set — hand-drawn astrological marks.
 *
 * These share their path data with the ambient background doodles
 * (CosmicBackground.tsx), so UI icons and atmosphere have one drawing style.
 * For generic UI icons (arrows, share, alerts, chevrons) use lucide-react;
 * this set covers only the astrological marks lucide doesn't have.
 *
 * Usage:
 *   <Glyph name="scorpio" size={18} className="text-gold-bright" />
 *   <SignGlyph sign="Scorpio" size={18} />   // accepts "Scorpio" | "scorpio"
 *   <Star4 size={11} className="text-gold" />  // the recurring brand marker
 */
import type { SVGProps } from "react";

const PATHS = {
  // ── Zodiac signs ──────────────────────────────────────────────────────────
  aries:       "M12 4 C8 4 4 8 4 12 M12 4 C16 4 20 8 20 12 M12 4 L12 20",
  taurus:      "M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10M7 16C7 13 5 9 4 7M17 16C17 13 19 9 20 7",
  gemini:      "M8 4v16M16 4v16M8 4h8M8 20h8",
  cancer:      "M6 10a5 5 0 0 0 10 0M18 14a5 5 0 0 0-10 0M3 10a2 2 0 1 0 4 0M17 14a2 2 0 1 0 4 0",
  leo:         "M8 12a5 5 0 1 1 10 0M18 12c2 3 2 7 0 9s-4 2-5 0",
  virgo:       "M4 5v13M4 5c2-2 4-3 5-3s3 1.5 4 3 2.5-3 5-3M13 5v9a3.5 3.5 0 0 1-7 0",
  libra:       "M3 17h18M8 17a4 4 0 0 1 8 0M3 20h18",
  scorpio:     "M4 8v8M4 8l4 4-4 4M8 8v8M8 8l4 4-4 4M12 8v8M16 12h5M19 10l2 2-2 2",
  sagittarius: "M5 19L19 5M14 5h5v5",
  capricorn:   "M4 8c0-3 2-6 5-6s5 3 5 6v8M14 10c1 4 4 8 7 10",
  aquarius:    "M3 8c3-3 6-3 9 0s6 3 9 0M3 16c3-3 6-3 9 0s6 3 9 0",
  pisces:      "M8 4c-3 4-3 12 0 16M16 4c3 4 3 12 0 16M5 12h14",

  // ── Planetary / romantic marks ───────────────────────────────────────────
  venus:       "M12 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 14v4M9 21h6",
  mars:        "M16 3l5 5-5 5M21 8H10a7 7 0 1 0 0 8",
  mercury:     "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v6M9 19h6M9 6C9 4 10 3 12 3s3 1 3 3",
  sun:         "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  crescent:    "M20 12a8 8 0 1 1-8-8 6 6 0 0 0 8 8z",
  heart:       "M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z",
  infinity:    "M7 12C7 9 9 7 12 7s5 2 5 5-2 5-5 5-5-2-5-5zm5 0c0 3 2 5 5 5s5-2 5-5-2-5-5-5-5 2-5 5z",
  star4:       "M12 2l1.5 8.5L22 12l-8.5 1.5L12 22l-1.5-8.5L2 12l8.5-1.5z",
} as const;

export type GlyphName = keyof typeof PATHS;

export const ZODIAC_GLYPHS: GlyphName[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

type GlyphProps = {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export function Glyph({ name, size = 20, strokeWidth = 1.5, ...props }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Zodiac glyph looked up by sign name — accepts "Scorpio" or "scorpio". */
export function SignGlyph({ sign, ...rest }: { sign: string } & Omit<GlyphProps, "name">) {
  const key = sign.toLowerCase() as GlyphName;
  if (!(key in PATHS)) return null;
  return <Glyph name={key} {...rest} />;
}

/** The recurring brand marker — a small filled four-point star. */
export function Star4({
  size = 11,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS.star4} />
    </svg>
  );
}
