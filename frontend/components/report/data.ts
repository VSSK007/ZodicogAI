/**
 * Pure data helpers shared by the long-form report and its story mode.
 */
import type { FullResult } from "@/components/report/types";

/** Per-dimension data colours (categorical, used only for bars). */
export const DIM_COLORS: Record<string, string> = {
  Emotional: "#a78bfa", Romantic: "#fb7185", Behavioral: "#60a5fa", Intimacy: "#818cf8",
  "Love Style": "#fb923c", "Love Language": "#2dd4bf", Numerology: "#fbbf24", Zodiac: "#f472b6",
};

export const STABILITY: Record<string, { color: string; label: string }> = {
  stable:   { color: "var(--color-success)", label: "Stable" },
  moderate: { color: "var(--color-warning)", label: "Moderate" },
  volatile: { color: "var(--color-danger)",  label: "Volatile" },
};

export function dimensions(r: FullResult) {
  return [
    { name: "Emotional",     score: r.emotional.emotional_compatibility_score },
    { name: "Romantic",      score: r.romantic.romantic_compatibility_score },
    { name: "Behavioral",    score: r.vector_similarity_percent },
    { name: "Intimacy",      score: r.sextrology.sexual_compatibility_score },
    { name: "Love Style",    score: r.love_style.love_style_compatibility_score },
    { name: "Love Language", score: r.love_language.love_language_compatibility_score },
    { name: "Numerology",    score: r.numerology_compat.compatibility_score },
    { name: "Zodiac",        score: r.zodiac_compatibility_score },
  ];
}

export function verdictFor(score: number) {
  if (score >= 80) return "A rare alignment";
  if (score >= 65) return "Strong foundations";
  if (score >= 45) return "Workable, with effort";
  return "Real friction to navigate";
}
