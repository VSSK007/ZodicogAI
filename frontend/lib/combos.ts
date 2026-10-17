/**
 * The 192 sign x MBTI guides at /blog/types/<sign>-<type> (e.g. /blog/types/leo-intj).
 * Pure helpers: slugs, parsing, and the full list for the sitemap and hub page.
 */
import { SIGN_KEYS, type SignKey } from "@/lib/aspects";

export const MBTI_KEYS = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type Mbti = (typeof MBTI_KEYS)[number];
export interface Combo {
  sign: SignKey;
  mbti: Mbti;
}

export const comboSlug = (sign: string, mbti: string) => `${sign.toLowerCase()}-${mbti.toLowerCase()}`;
export const comboPath = (sign: string, mbti: string) => `/blog/types/${comboSlug(sign, mbti)}`;
export const signName = (sign: string) => sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();

/** "leo-intj" -> { sign: "leo", mbti: "INTJ" }; null for anything that isn't one of the 192. */
export function parseCombo(slug: string): Combo | null {
  const m = /^([a-z]+)-([a-z]{4})$/.exec(slug);
  if (!m) return null;
  const sign = m[1] as SignKey;
  const mbti = m[2].toUpperCase() as Mbti;
  if (!(SIGN_KEYS as readonly string[]).includes(sign)) return null;
  if (!(MBTI_KEYS as readonly string[]).includes(mbti)) return null;
  return { sign, mbti };
}

export const ALL_COMBOS: Combo[] = SIGN_KEYS.flatMap((sign) => MBTI_KEYS.map((mbti) => ({ sign, mbti })));

/** What /blog/combo/{sign}/{mbti} returns. */
export interface ComboResponse {
  sign: string;
  mbti: string;
  type_name: string;
  alignment: number;
  blend: Record<string, number>;
  gaps: { axis: string; sign: number; type: number; gap: number }[];
  article: {
    overview: string;
    strengths: string[];
    blind_spots: string[];
    in_love: string;
    at_work: string;
    best_matches: { sign: string; mbti: string; why: string }[];
  };
}
