/**
 * Zodiac color profiles — mirrors backend/engines/color_engine.py
 * All color logic is pure client-side: no extra API call needed.
 */

export interface ColorProfile {
  name: string;
  hex: string;
  keywords: string[];
}

export const ZODIAC_COLORS: Record<string, ColorProfile> = {
  Aries:       { name: "Aura Red",          hex: "#EF4444", keywords: ["passion", "courage", "fire", "visibility"] },
  Taurus:      { name: "Emerald Aura",      hex: "#22C55E", keywords: ["stability", "growth", "abundance", "grounding"] },
  Gemini:      { name: "Solar Yellow",      hex: "#EAB308", keywords: ["intellect", "joy", "creativity", "brightness"] },
  Cancer:      { name: "Celestial Blue",    hex: "#60A5FA", keywords: ["intuition", "nurturing", "sensitivity", "compassion"] },
  Leo:         { name: "Radiant Gold",      hex: "#FBBF24", keywords: ["royalty", "strength", "radiance", "leadership"] },
  Virgo:       { name: "Teal Clarity",      hex: "#0D9488", keywords: ["precision", "healing", "clarity", "analysis"] },
  Libra:       { name: "Rose Aura",         hex: "#F472B6", keywords: ["harmony", "beauty", "balance", "love"] },
  Scorpio:     { name: "Burgundy Aura",     hex: "#9F1239", keywords: ["mystery", "transformation", "depth", "magnetism"] },
  Sagittarius: { name: "Violet Aura",       hex: "#7C3AED", keywords: ["freedom", "wisdom", "exploration", "awareness"] },
  Capricorn:   { name: "Deep Crimson Aura", hex: "#991B1B", keywords: ["ambition", "tradition", "discipline", "resilience"] },
  Aquarius:    { name: "Turquoise Aura",    hex: "#06B6D4", keywords: ["innovation", "vision", "creativity", "freedom"] },
  Pisces:      { name: "Teal Aura",         hex: "#2DD4BF", keywords: ["healing", "compassion", "intuition", "flow"] },
};

export function getZodiacSign(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export function getAuraColor(sign: string): ColorProfile {
  return ZODIAC_COLORS[sign] ?? ZODIAC_COLORS["Aries"];
}

/** Average two hex colours channel-by-channel. */
export function blendHex(hexA: string, hexB: string): string {
  const p = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = p(hexA), b = p(hexB);
  const m = a.map((v, i) => Math.round((v + b[i]) / 2));
  return `#${m.map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("")}`;
}
