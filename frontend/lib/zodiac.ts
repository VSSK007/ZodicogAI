/**
 * Canonical zodiac helpers — the single source for sign lookup and metadata.
 * Replaces the per-page inline `getSign()` copies.
 */
import { getZodiacSign } from "@/lib/colors";
import type { GlyphName } from "@/components/ui/glyphs";

/** Canonical sign-from-date lookup (re-exported from lib/colors so there is one implementation). */
export const getSign = getZodiacSign;

export interface SignMeta {
  glyph: GlyphName;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  dates: string;
  /** Two short trait lines used by the homepage teaser — deterministic, no AI. */
  traits: [string, string];
}

export const SIGN_META: Record<string, SignMeta> = {
  Aries:       { glyph: "aries",       element: "Fire",  modality: "Cardinal", dates: "Mar 21 – Apr 19",
    traits: ["Leads with instinct — decides fast, commits hard", "Runs hottest on intensity and momentum"] },
  Taurus:      { glyph: "taurus",      element: "Earth", modality: "Fixed",    dates: "Apr 20 – May 20",
    traits: ["Builds slowly and keeps what it builds", "Highest stability score of the twelve signs"] },
  Gemini:      { glyph: "gemini",      element: "Air",   modality: "Mutable",  dates: "May 21 – Jun 20",
    traits: ["Expressiveness off the charts — connection through words", "Adapts faster than any fixed sign can follow"] },
  Cancer:      { glyph: "cancer",      element: "Water", modality: "Cardinal", dates: "Jun 21 – Jul 22",
    traits: ["Reads a room before anyone speaks", "Emotional depth is the operating system"] },
  Leo:         { glyph: "leo",         element: "Fire",  modality: "Fixed",    dates: "Jul 23 – Aug 22",
    traits: ["Warmth with a dominance score to match", "Loyalty is theatrical — and completely genuine"] },
  Virgo:       { glyph: "virgo",       element: "Earth", modality: "Mutable",  dates: "Aug 23 – Sep 22",
    traits: ["Love expressed as precision and acts of service", "Notices everything; mentions a curated ten percent"] },
  Libra:       { glyph: "libra",       element: "Air",   modality: "Cardinal", dates: "Sep 23 – Oct 22",
    traits: ["Harmony-seeking with real strategic instincts", "Balances every scale except its own schedule"] },
  Scorpio:     { glyph: "scorpio",     element: "Water", modality: "Fixed",    dates: "Oct 23 – Nov 21",
    traits: ["Peak intensity — the engines' highest depth rating", "All-or-nothing attachment, no middle setting"] },
  Sagittarius: { glyph: "sagittarius", element: "Fire",  modality: "Mutable",  dates: "Nov 22 – Dec 21",
    traits: ["Freedom-first — adaptability near the maximum", "Optimism that survives contact with reality"] },
  Capricorn:   { glyph: "capricorn",   element: "Earth", modality: "Cardinal", dates: "Dec 22 – Jan 19",
    traits: ["Ambition with a long memory and a longer plan", "Slow to open; unshakeable once committed"] },
  Aquarius:    { glyph: "aquarius",    element: "Air",   modality: "Fixed",    dates: "Jan 20 – Feb 18",
    traits: ["Original to the point of contrarian", "Connects through ideas before feelings"] },
  Pisces:      { glyph: "pisces",      element: "Water", modality: "Mutable",  dates: "Feb 19 – Mar 20",
    traits: ["Empathy so high it needs boundaries", "Imagination is the first language, words second"] },
};

export const ELEMENT_COLOR: Record<SignMeta["element"], string> = {
  Fire:  "#f97316",
  Earth: "#10b981",
  Air:   "#38bdf8",
  Water: "#6366f1",
};
