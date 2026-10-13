/**
 * Zodiac aspects between two sun signs, by the number of signs between them
 * (30 degrees per sign). Pure and static: no AI, no dates.
 */
export const SIGN_KEYS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

export type SignKey = (typeof SIGN_KEYS)[number];

export interface Aspect {
  name: string;
  degrees: number;
  /** One line on what the angle tends to feel like between two people. */
  meaning: string;
  tone: "harmonious" | "dynamic" | "neutral";
}

const ASPECTS: Record<number, Aspect> = {
  0: { name: "Conjunct", degrees: 0, tone: "neutral", meaning: "Same sign: you see yourself in each other, the good and the not-so-good." },
  1: { name: "Semi-sextile", degrees: 30, tone: "neutral", meaning: "Neighbours with little in common, so each has something new to learn from the other." },
  2: { name: "Sextile", degrees: 60, tone: "harmonious", meaning: "An easy, friendly angle: ideas and energy flow when you make the effort." },
  3: { name: "Square", degrees: 90, tone: "dynamic", meaning: "Friction that drives growth: you challenge each other, for better and worse." },
  4: { name: "Trine", degrees: 120, tone: "harmonious", meaning: "The most natural flow: shared element, effortless understanding." },
  5: { name: "Quincunx", degrees: 150, tone: "neutral", meaning: "An awkward fit that asks for adjustment from both sides." },
  6: { name: "Opposite", degrees: 180, tone: "dynamic", meaning: "Pulls both ways: magnetic, complementary, and the hardest angle to keep balanced." },
};

/** Lowercase, tolerant of "Leo", "leo" and stray spaces; null when it isn't a sign. */
export function normalizeSign(sign: string | null | undefined): SignKey | null {
  const k = (sign ?? "").trim().toLowerCase();
  return (SIGN_KEYS as readonly string[]).includes(k) ? (k as SignKey) : null;
}

/** Signs apart on the wheel, the short way round (0-6). */
export function signDistance(a: SignKey, b: SignKey): number {
  const d = Math.abs(SIGN_KEYS.indexOf(a) - SIGN_KEYS.indexOf(b));
  return Math.min(d, 12 - d);
}

export function aspectBetween(a: string, b: string): Aspect | null {
  const ka = normalizeSign(a);
  const kb = normalizeSign(b);
  if (!ka || !kb) return null;
  return ASPECTS[signDistance(ka, kb)];
}
