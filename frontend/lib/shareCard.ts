/**
 * Pure helpers that pull a score and one headline sentence out of a saved
 * reading's payload, for share cards (no React, safe in route handlers).
 */

export const TYPE_LABELS: Record<string, string> = {
  hybrid_analysis: "Behavioral Profile",
  compatibility_analysis: "Compatibility",
  emotional_compatibility: "Emotional Compatibility",
  romantic_compatibility: "Romantic Compatibility",
  sextrology_analysis: "Sextrology",
  sextrology_solo_analysis: "Sextrology",
  love_style_analysis: "Love Style",
  love_language_analysis: "Love Language",
  full_relationship_intelligence: "Full Synastry Report",
  zodiac_article: "Zodiac Deep-Dive",
  color_analysis: "Aura Colors",
  color_pair_analysis: "Aura Colors",
  numerology_analysis: "Numerology",
  numerology_pair_analysis: "Numerology",
  group_analysis: "Group Chemistry",
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

const SCORE_KEYS = [
  "overall_score",
  "group_score",
  "overall_compatibility_score",
  "romantic_compatibility_score",
  "emotional_compatibility_score",
  "sexual_compatibility_score",
  "love_style_compatibility_score",
  "love_language_compatibility_score",
  "compatibility_score",
  "overall",
];

const HEADLINE_CONTAINERS = ["relationship_intelligence", "compatibility", "numerology_compat"];

/** 0-100 headline score, looking one or two levels deep. null when the type has none. */
export function extractScore(payload: unknown): number | null {
  if (!isObj(payload)) return null;
  const scan = (o: Obj): number | null => {
    for (const k of SCORE_KEYS) {
      const v = o[k];
      if (typeof v === "number" && Number.isFinite(v)) return Math.round(Math.min(100, Math.max(0, v)));
    }
    return null;
  };
  const top = scan(payload);
  if (top !== null) return top;

  // Containers that hold *the* headline score, in priority order. Only after these do we
  // fall back to any nested object - otherwise a sub-engine's score (e.g. "emotional" in the
  // full report) would be mistaken for the overall one.
  for (const k of HEADLINE_CONTAINERS) {
    const v = payload[k];
    if (isObj(v)) {
      const inner = scan(v);
      if (inner !== null) return inner;
    }
  }
  for (const v of Object.values(payload)) {
    if (isObj(v)) {
      const inner = scan(v);
      if (inner !== null) return inner;
    }
  }
  return null;
}

const PREFERRED = [
  "relationship_dynamic",
  "overview",
  "summary",
  "reading",
  "compatibility_reading",
  "headline",
  "core_dynamic",
  "pair_advice",
];

function stripMd(s: string): string {
  return s.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
}

/** The first sentence(s) of the most "headline-like" text in the payload, <= max characters. */
export function extractKeyLine(payload: unknown, max = 170): string {
  const found: string[] = [];
  const walk = (v: unknown, depth: number) => {
    if (depth > 3) return;
    if (isObj(v)) {
      for (const k of PREFERRED) {
        const s = v[k];
        if (typeof s === "string" && s.trim().length > 30) found.push(stripMd(s));
      }
      for (const child of Object.values(v)) walk(child, depth + 1);
    }
  };
  walk(payload, 0);

  let text = found[0] ?? "";
  if (!text && isObj(payload)) {
    const anyLong = (function first(o: Obj, d: number): string {
      for (const v of Object.values(o)) {
        if (typeof v === "string" && v.trim().length > 60) return stripMd(v);
        if (isObj(v) && d < 3) {
          const r = first(v, d + 1);
          if (r) return r;
        }
      }
      return "";
    })(payload, 0);
    text = anyLong;
  }
  if (!text) return "";
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (stop > max * 0.5) return cut.slice(0, stop + 1);
  return cut.replace(/\s+\S*$/, "") + "…";
}
