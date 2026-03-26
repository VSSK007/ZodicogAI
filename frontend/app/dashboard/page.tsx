"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreRing from "@/components/ScoreRing";
import TraitRadar from "@/components/TraitRadar";
import BehavioralMap from "@/components/BehavioralMap";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";
import { renderMd } from "@/lib/renderMd";
import { getZodiacSign } from "@/lib/colors";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

interface NumerologyCompat {
  compatibility_score: number;
  life_path_score: number;
  expression_score: number;
  cross_score: number;
  pursue_signal: "pursue" | "caution" | "avoid";
}

interface FullResult {
  vector_similarity_percent: number;
  element_compatibility: string;
  modality_interaction: string;
  zodiac_compatibility_score: number;
  emotional: { emotional_compatibility_score: number; emotional_expression_similarity: number; emotional_intensity_alignment: number; emotional_stability_compatibility: number; };
  romantic: { romantic_compatibility_score: number; attachment_pacing_similarity: number; affection_expression_similarity: number; romantic_polarity_score: number; };
  sextrology: { sexual_compatibility_score: number; intimacy_intensity_alignment: number; intimacy_pacing_alignment: number; dominance_receptiveness_polarity: number; emotional_physical_balance_similarity: number; };
  love_style: { love_style_compatibility_score: number; a_love_style: { dominant_style: string }; b_love_style: { dominant_style: string }; };
  love_language: { love_language_compatibility_score: number; a_love_language: { primary_language: string }; b_love_language: { primary_language: string }; };
  numerology_compat: NumerologyCompat;
  relationship_intelligence: { overall_score: number; stability_prediction: "stable" | "moderate" | "volatile"; conflict_probability: number; strengths: string[]; risks: string[]; };
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STABILITY_COLOR: Record<string, string> = {
  stable:   "#34a853",
  moderate: "#fbbc04",
  volatile: "#ea4335",
};

const SIGNAL_STYLE: Record<string, string> = {
  pursue:  "bg-[#34a853]/10 text-[#34a853] border-[#34a853]/25",
  caution: "bg-[#fbbc04]/10 text-[#fbbc04] border-[#fbbc04]/25",
  avoid:   "bg-[#ea4335]/10 text-[#ea4335] border-[#ea4335]/25",
};

const SIGNAL_LABEL: Record<string, string> = {
  pursue:  "✓ Numerology Match",
  caution: "⚠ Numerology Caution",
  avoid:   "✗ Numerology Clash",
};

const DIM_COLORS: Record<string, string> = {
  Emotional:       "#a78bfa",
  Romantic:        "#fb7185",
  Behavioral:      "#60a5fa",
  Intimacy:        "#818cf8",
  "Love Style":    "#fb923c",
  "Love Language": "#2dd4bf",
  Numerology:      "#fbbf24",
  Zodiac:          "#f472b6",
};

const CARD = "bg-[#16162a] border border-white/[0.07] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.5)] overflow-hidden";

const SLIDE_LABELS = ["Overview", "Dimensions", "Love Intel", "Vectors", "Risk", "AI Reading"];


// ── Small UI helpers ──────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#4285f4]" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-[#34a853]/15 text-[#34a853] border-[#34a853]/30" :
    score >= 65 ? "bg-[#4285f4]/15 text-[#4285f4] border-[#4285f4]/30" :
    score >= 45 ? "bg-[#fbbc04]/15 text-[#fbbc04] border-[#fbbc04]/30" :
                  "bg-[#ea4335]/15 text-[#ea4335] border-[#ea4335]/30";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums border ${cls}`}>
      {score.toFixed(0)}
    </span>
  );
}

function CardStripe({ color = "#4285f4" }: { color?: string }) {
  return (
    <div
      className="h-0.5 rounded-t-2xl"
      style={{ background: `linear-gradient(to right, ${color}90, transparent)` }}
    />
  );
}

function dims(r: FullResult) {
  return [
    { name: "Emotional",      score: r.emotional.emotional_compatibility_score },
    { name: "Romantic",       score: r.romantic.romantic_compatibility_score },
    { name: "Behavioral",     score: r.vector_similarity_percent },
    { name: "Intimacy",       score: r.sextrology.sexual_compatibility_score },
    { name: "Love Style",     score: r.love_style.love_style_compatibility_score },
    { name: "Love Language",  score: r.love_language.love_language_compatibility_score },
    { name: "Numerology",     score: r.numerology_compat.compatibility_score },
    { name: "Zodiac",         score: r.zodiac_compatibility_score },
  ];
}

// ── Slide 1: Overview ─────────────────────────────────────────────────────────

function SlideOverview({ result, a, b }: { result: FullResult; a: PersonData; b: PersonData }) {
  const ri = result.relationship_intelligence;
  const nc = result.numerology_compat;
  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };
  const signA = getZodiacSign(Number(a.day), Number(a.month));
  const signB = getZodiacSign(Number(b.day), Number(b.month));

  return (
    <div className="space-y-4">
      {/* Persona cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: names.a, sign: signA, mbti: a.mbti, color: "#4285f4" },
          { label: names.b, sign: signB, mbti: b.mbti, color: "#a78bfa" },
        ].map(({ label, sign, mbti, color }) => (
          <div key={label} className={CARD}>
            <CardStripe color={color} />
            <div className="p-4">
              <p className="font-semibold text-white text-sm">{label}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-zinc-500">{sign}</span>
                {mbti && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-mono">
                    {mbti}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ScoreRing + prediction */}
      <div className={CARD}>
        <CardStripe />
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={ri.overall_score} size={148} label="Overall" color="#4285f4" />
          <div className="flex-1 space-y-4 w-full">
            <div>
              <Eyebrow>Prediction</Eyebrow>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold" style={{ color: STABILITY_COLOR[ri.stability_prediction] }}>
                  {ri.stability_prediction.charAt(0).toUpperCase() + ri.stability_prediction.slice(1)}
                </span>
                <span className="text-zinc-600 text-sm">stability</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${SIGNAL_STYLE[nc.pursue_signal]}`}>
                  {SIGNAL_LABEL[nc.pursue_signal]}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-600 mb-1.5">
                <span>Conflict Probability</span>
                <span>{ri.conflict_probability.toFixed(0)}%</span>
              </div>
              <div className="h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#ea4335]/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${ri.conflict_probability}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-metric strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Stability",     value: ri.stability_prediction.charAt(0).toUpperCase() + ri.stability_prediction.slice(1), color: STABILITY_COLOR[ri.stability_prediction] },
          { label: "Conflict Risk", value: `${ri.conflict_probability.toFixed(0)}%`, color: "#ea4335" },
          { label: "Element",       value: result.element_compatibility, sub: result.modality_interaction },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className={CARD}>
            <div className="p-4">
              <Eyebrow>{label}</Eyebrow>
              <p className="text-base font-bold" style={{ color: color || "white" }}>{value}</p>
              {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 2: Dimensions ───────────────────────────────────────────────────────

function SlideDimensions({ result }: { result: FullResult }) {
  const nc = result.numerology_compat;
  return (
    <div className="space-y-4">
      <div className={CARD}>
        <CardStripe />
        <div className="p-6">
          <Eyebrow>Compatibility Breakdown</Eyebrow>
          <h2 className="text-sm font-semibold text-zinc-300 mb-5">Eight Dimensions</h2>
          <div>
            {dims(result).map((d, i) => (
              <motion.div
                key={d.name}
                className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className="w-28 text-sm text-zinc-400 flex-shrink-0">{d.name}</div>
                <div className="flex-1 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: DIM_COLORS[d.name] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.score}%` }}
                    transition={{ duration: 0.7, delay: i * 0.07 }}
                  />
                </div>
                <ScoreChip score={d.score} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Numerology summary */}
      <div className={CARD}>
        <CardStripe color="#fbbf24" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Eyebrow>Numerology</Eyebrow>
              <h2 className="text-sm font-semibold text-zinc-300">Number Compatibility</h2>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${SIGNAL_STYLE[nc.pursue_signal]}`}>
              {nc.compatibility_score.toFixed(0)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Life Path",  value: nc.life_path_score },
              { label: "Expression", value: nc.expression_score },
              { label: "Cross-Pair", value: nc.cross_score },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-zinc-200 tabular-nums" style={{ fontFamily: "var(--font-manrope)" }}>
                  {value.toFixed(0)}<span className="text-xs text-zinc-600 ml-0.5">%</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide 3: Love Intel ───────────────────────────────────────────────────────

function SlideLoveIntel({ result, a, b }: { result: FullResult; a: PersonData; b: PersonData }) {
  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };
  const ls = result.love_style;
  const ll = result.love_language;

  return (
    <div className="space-y-4">
      {/* Compat score bars */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Love Style",     score: ls.love_style_compatibility_score,     color: "#fb923c" },
          { label: "Love Language",  score: ll.love_language_compatibility_score,  color: "#2dd4bf" },
        ].map(({ label, score, color }) => (
          <div key={label} className={CARD}>
            <CardStripe color={color} />
            <div className="p-4">
              <Eyebrow>{label}</Eyebrow>
              <p className="text-3xl font-extrabold tabular-nums" style={{ color, fontFamily: "var(--font-manrope)" }}>
                {score.toFixed(0)}<span className="text-sm text-zinc-600 ml-0.5">%</span>
              </p>
              <div className="h-[2px] bg-white/[0.05] rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4 detail cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: `${names.a} Love Style`,     val: ls.a_love_style.dominant_style,                             color: "#fb923c" },
          { label: `${names.b} Love Style`,     val: ls.b_love_style.dominant_style,                             color: "#fb923c" },
          { label: `${names.a} Love Language`,  val: ll.a_love_language.primary_language.replace(/_/g, " "),    color: "#2dd4bf" },
          { label: `${names.b} Love Language`,  val: ll.b_love_language.primary_language.replace(/_/g, " "),    color: "#2dd4bf" },
        ].map(({ label, val, color }, i) => (
          <motion.div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-semibold capitalize" style={{ color }}>{val}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 4: Trait Vectors ────────────────────────────────────────────────────

function SlideVectors({ result, a, b }: { result: FullResult; a: PersonData; b: PersonData }) {
  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };
  return (
    <div className="space-y-4">
      <div className={CARD}>
        <CardStripe color="#60a5fa" />
        <div className="p-6">
          <Eyebrow>Trait Vectors</Eyebrow>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Behavioral Comparison</h2>
          <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />
        </div>
      </div>
      <BehavioralMap aTraits={result.a_traits} bTraits={result.b_traits} nameA={names.a} nameB={names.b} />
    </div>
  );
}

// ── Slide 5: Strengths & Risks ────────────────────────────────────────────────

function SlideRisk({ result }: { result: FullResult }) {
  const ri = result.relationship_intelligence;
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className={CARD}>
          <div className="h-0.5 bg-gradient-to-r from-[#34a853]/50 to-transparent" />
          <div className="p-5">
            <Eyebrow>Strengths</Eyebrow>
            <ol className="space-y-2.5 mt-1">
              {ri.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2.5 text-sm"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-[#34a853] font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="text-zinc-300">{s}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        <div className={CARD}>
          <div className="h-0.5 bg-gradient-to-r from-[#ea4335]/50 to-transparent" />
          <div className="p-5">
            <Eyebrow>Risk Areas</Eyebrow>
            <ol className="space-y-2.5 mt-1">
              {ri.risks.map((r, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2.5 text-sm"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-[#ea4335] font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="text-zinc-300">{r}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide 6: AI Reading ───────────────────────────────────────────────────────

function SlideAI({ result }: { result: FullResult }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="relative w-2 h-2 shrink-0">
          <div className="absolute inset-0 rounded-full bg-[#4285f4] animate-ping opacity-60" />
          <div className="w-2 h-2 rounded-full bg-[#4285f4]" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 tracking-wide">AI Interpretation</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4285f4]/10 text-[#4285f4]/80 border border-[#4285f4]/20">
          Gemini 2.5 Flash
        </span>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {(["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const).map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.1em] font-semibold mb-2">
              {key.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(result.analysis[key])}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<FullResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const touchX = useRef(0);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(5, idx));
    setSlideDir(clamped >= activeSlide ? 1 : -1);
    setActiveSlide(clamped);
  }, [activeSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (!result) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { setSlideDir(1);  setActiveSlide(p => Math.min(5, p + 1)); }
      if (e.key === "ArrowLeft")  { setSlideDir(-1); setActiveSlide(p => Math.max(0, p - 1)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [result]);

  // Reset to slide 0 when new result arrives
  useEffect(() => { if (result) { setActiveSlide(0); setSlideDir(1); } }, [result]);

  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<FullResult>("/analyze/full", pairBody(a, b));
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function renderSlide(i: number) {
    if (!result) return null;
    switch (i) {
      case 0: return <SlideOverview    result={result} a={a} b={b} />;
      case 1: return <SlideDimensions  result={result} />;
      case 2: return <SlideLoveIntel   result={result} a={a} b={b} />;
      case 3: return <SlideVectors     result={result} a={a} b={b} />;
      case 4: return <SlideRisk        result={result} />;
      case 5: return <SlideAI          result={result} />;
      default: return null;
    }
  }

  return (
    <>
      {/* Fixed floating sub-nav — appears when results are visible */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="fixed left-1/2 -translate-x-1/2 z-30 top-2 md:top-[52px]"
          >
            <div className="flex items-center gap-0.5 bg-[#0c0c1c]/90 backdrop-blur-xl border border-white/[0.08] rounded-[14px] px-1.5 py-1 shadow-xl max-w-[calc(100vw-24px)] md:max-w-none">
              <button
                onClick={() => goTo(activeSlide - 1)}
                disabled={activeSlide === 0}
                className="w-7 h-7 flex items-center justify-center rounded-[10px] text-zinc-400 hover:text-white disabled:opacity-20 transition-colors text-base leading-none shrink-0"
              >
                ‹
              </button>
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
                {SLIDE_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`px-2.5 md:px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all whitespace-nowrap ${
                      activeSlide === i
                        ? "bg-[#4285f4] text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goTo(activeSlide + 1)}
                disabled={activeSlide === 5}
                className="w-7 h-7 flex items-center justify-center rounded-[10px] text-zinc-400 hover:text-white disabled:opacity-20 transition-colors text-base leading-none shrink-0"
              >
                ›
              </button>
              <span className="text-[10px] text-zinc-600 ml-1 tabular-nums pr-1 shrink-0">{activeSlide + 1}/6</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen px-4 md:px-6 py-6 md:py-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4285f4]" />
            <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Relationship Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-manrope)" }}>
            Synastry
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Full read — 8 dimensions + AI interpretation</p>
        </div>

        {/* Input forms — hidden once result is shown */}
        {!result && (<>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <PersonForm label="Person A" value={a} onChange={setA} />
            <PersonForm label="Person B" value={b} onChange={setB} />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 disabled:opacity-40 transition mb-10"
          >
            {loading ? "Reading the stars…" : "Generate Synastry Report"}
          </button>
        </>)}

        {/* Carousel results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="pt-10 md:pt-12"
            >
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors mb-4"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Try again
              </button>

              {/* Touch wrapper */}
              <div
                onTouchStart={(e) => { touchX.current = e.targetTouches[0].clientX; }}
                onTouchEnd={(e) => {
                  const delta = touchX.current - e.changedTouches[0].clientX;
                  if (Math.abs(delta) > 40) goTo(activeSlide + (delta > 0 ? 1 : -1));
                }}
              >
                <AnimatePresence mode="wait" custom={slideDir}>
                  <motion.div
                    key={activeSlide}
                    custom={slideDir}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: d * 32 }),
                      center: { opacity: 1, x: 0 },
                      exit:  (d: number) => ({ opacity: 0, x: d * -32 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {renderSlide(activeSlide)}
                  </motion.div>
                </AnimatePresence>

                {/* Dot pagination */}
                <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                  {SLIDE_LABELS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-200 ${
                        activeSlide === i
                          ? "w-5 h-1.5 bg-[#4285f4]"
                          : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
