/**
 * A compact, plain-text summary of a saved reading for Zodicognac (<= 1,500
 * characters), plus starter questions derived from the same data. The chat
 * sends the summary instead of the whole JSON payload; the server treats it as
 * untrusted reference data (see backend/chat/chat_handler.reading_block).
 */
import { dimensions, verdictFor } from "@/components/report/data";
import type { FullResult, ReportPersonas } from "@/components/report/types";
import { extractKeyLine, extractScore, TYPE_LABELS } from "@/lib/shareCard";

export const SUMMARY_MAX = 1500;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : "");

function cap(text: string, max = SUMMARY_MAX): string {
  const t = text.replace(/\*+/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return t.length <= max ? t : t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function firstSentence(text: string, max = 220): string {
  const t = text.replace(/\*+/g, "").trim();
  const m = t.match(/^.*?[.!?](\s|$)/);
  const s = (m ? m[0] : t).trim();
  return s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function isFullReport(p: Obj): p is Obj & FullResult & { personas?: ReportPersonas } {
  return isObj(p.relationship_intelligence) && isObj(p.emotional) && isObj(p.numerology_compat);
}

function isGroup(p: Obj): boolean {
  return Array.isArray(p.people) && Array.isArray(p.matrix) && isObj(p.glue);
}

function describe(persona: { name: string; sign?: string; mbti?: string } | undefined, fallback: string) {
  if (!persona) return fallback;
  const bits = [persona.sign, persona.mbti].filter(Boolean).join(", ");
  return bits ? `${persona.name} (${bits})` : persona.name;
}

export function summarizeReading(analysisType: string, title: string, payload: unknown): string {
  const label = TYPE_LABELS[analysisType] ?? analysisType.replace(/_/g, " ");
  if (!isObj(payload)) return cap(`${title}. ${label}.`);

  if (isFullReport(payload)) {
    const ri = payload.relationship_intelligence;
    const dims = dimensions(payload)
      .map((d) => `${d.name} ${Math.round(d.score)}`)
      .join(", ");
    const who = payload.personas
      ? `${describe(payload.personas.a, "Person A")} and ${describe(payload.personas.b, "Person B")}`
      : title.replace(/ Synastry Report$/, "");
    const lines = [
      `${label}: ${who}.`,
      `Overall ${Math.round(ri.overall_score)}/100 (${verdictFor(ri.overall_score)}).`,
      `Scores: ${dims}.`,
      `Predicted stability: ${ri.stability_prediction}; conflict risk ${Math.round(ri.conflict_probability)}%.`,
      `Elements: ${payload.element_compatibility}; modality: ${payload.modality_interaction}. Numerology signal: ${payload.numerology_compat.pursue_signal}.`,
      ri.strengths.length ? `Strengths: ${ri.strengths.join("; ")}.` : "",
      ri.risks.length ? `Risks: ${ri.risks.join("; ")}.` : "",
      payload.analysis?.relationship_dynamic && payload.analysis.relationship_dynamic !== "—"
        ? `Dynamic: ${firstSentence(payload.analysis.relationship_dynamic)}`
        : "",
      payload.analysis?.conflict_risk && payload.analysis.conflict_risk !== "—"
        ? `Conflict: ${firstSentence(payload.analysis.conflict_risk)}`
        : "",
    ];
    return cap(lines.filter(Boolean).join("\n"));
  }

  if (isGroup(payload)) {
    const people = (payload.people as { name: string; sign?: string; mbti?: string }[]).map((p) => describe(p, p.name)).join(", ");
    const glue = payload.glue as { name: string; average: number };
    const strongest = payload.strongest as { names: string[]; score: number };
    const spiciest = payload.spiciest as { names: string[]; score: number };
    const analysis = isObj(payload.analysis) ? payload.analysis : {};
    return cap(
      [
        `${label}: ${people}.`,
        `Group score ${Math.round(Number(payload.group_score))}/100.`,
        `Glue: ${glue.name} (average ${Math.round(glue.average)}).`,
        `Strongest pair: ${strongest.names.join(" + ")} (${Math.round(strongest.score)}).`,
        `Lowest pair: ${spiciest.names.join(" + ")} (${Math.round(spiciest.score)}).`,
        str(analysis.group_dynamic) && str(analysis.group_dynamic) !== "—" ? `Dynamic: ${firstSentence(str(analysis.group_dynamic))}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  // Any other reading: title, type, headline score, the most headline-like sentence,
  // and a few of its top-level scores.
  const score = extractScore(payload);
  const scores = Object.entries(payload)
    .filter(([k, v]) => typeof v === "number" && /score|percent|compatib/i.test(k))
    .slice(0, 8)
    .map(([k, v]) => `${k.replace(/_/g, " ")} ${Math.round(Number(v))}`);
  return cap(
    [
      `${title || label}. Type: ${label}.`,
      score !== null ? `Headline score ${score}/100.` : "",
      scores.length ? `Scores: ${scores.join(", ")}.` : "",
      extractKeyLine(payload, 500) ? `Key point: ${extractKeyLine(payload, 500)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** Three questions worth asking about this reading, from its own numbers. */
export function starterQuestions(analysisType: string, payload: unknown): string[] {
  const generic = [
    "What is the single most important thing in this reading?",
    "How do I actually act on this?",
    "What should I watch out for?",
  ];
  if (!isObj(payload)) return generic;

  if (isFullReport(payload)) {
    const dims = dimensions(payload);
    const low = dims.reduce((m, d) => (d.score < m.score ? d : m));
    const top = dims.reduce((m, d) => (d.score > m.score ? d : m));
    const risk = payload.relationship_intelligence.risks[0];
    return [
      `Why is ${low.name.toLowerCase()} our lowest score (${Math.round(low.score)})?`,
      risk ? `What should we do about ${risk.toLowerCase()}?` : "What should we watch out for?",
      `How can we make the most of our strongest area, ${top.name.toLowerCase()}?`,
    ];
  }

  if (isGroup(payload)) {
    const glue = (payload.glue as { name: string }).name;
    const spiciest = (payload.spiciest as { names: string[] }).names.join(" and ");
    return [
      `Why is ${glue} the glue of this group?`,
      `How should ${spiciest} handle each other?`,
      "What's one thing this group should do together?",
    ];
  }

  void analysisType;
  return generic;
}
