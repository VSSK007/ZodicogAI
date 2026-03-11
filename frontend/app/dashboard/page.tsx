"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import BehavioralMap from "@/components/BehavioralMap";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

interface FullResult {
  vector_similarity_percent: number;
  element_compatibility: string;
  modality_interaction: string;
  emotional: { emotional_compatibility_score: number; emotional_expression_similarity: number; emotional_intensity_alignment: number; emotional_stability_compatibility: number; };
  romantic: { romantic_compatibility_score: number; attachment_pacing_similarity: number; affection_expression_similarity: number; romantic_polarity_score: number; };
  sextrology: { sexual_compatibility_score: number; intimacy_intensity_alignment: number; intimacy_pacing_alignment: number; dominance_receptiveness_polarity: number; emotional_physical_balance_similarity: number; };
  love_style: { love_style_compatibility_score: number; a_love_style: { dominant_style: string }; b_love_style: { dominant_style: string }; };
  love_language: { love_language_compatibility_score: number; a_love_language: { primary_language: string }; b_love_language: { primary_language: string }; };
  relationship_intelligence: { overall_score: number; stability_prediction: "stable" | "moderate" | "volatile"; conflict_probability: number; strengths: string[]; risks: string[]; };
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STABILITY_STYLE = {
  stable:   "bg-green-500/15 text-green-400 border-green-500/30",
  moderate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  volatile: "bg-red-500/15   text-red-400   border-red-500/30",
};

const DIM_COLORS: Record<string, string> = {
  Emotional: "#a855f7", Romantic: "#f43f5e", Behavioral: "#3b82f6",
  Intimacy: "#6366f1", "Love Style": "#f97316", "Love Language": "#14b8a6",
};

function dims(r: FullResult) {
  return [
    { name: "Emotional",     score: r.emotional.emotional_compatibility_score },
    { name: "Romantic",      score: r.romantic.romantic_compatibility_score },
    { name: "Behavioral",    score: r.vector_similarity_percent },
    { name: "Intimacy",      score: r.sextrology.sexual_compatibility_score },
    { name: "Love Style",    score: r.love_style.love_style_compatibility_score },
    { name: "Love Language", score: r.love_language.love_language_compatibility_score },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<FullResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const ri = result?.relationship_intelligence;
  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Full Relationship Report</h1>
        <p className="text-zinc-500 mt-1 text-sm">All 6 compatibility dimensions + AI interpretation</p>
      </div>

      {/* Input */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PersonForm label="Person A" value={a} onChange={setA} />
        <PersonForm label="Person B" value={b} onChange={setB} />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-40 transition mb-12"
      >
        {loading ? "Analyzing…" : "Generate Full Report"}
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && ri && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Overall Score + Stability */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={ri.overall_score} size={180} label="Overall Score" color="#f59e0b" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STABILITY_STYLE[ri.stability_prediction]}`}>
                    {ri.stability_prediction.charAt(0).toUpperCase() + ri.stability_prediction.slice(1)}
                  </span>
                  <span className="text-sm text-zinc-500">Stability Prediction</span>
                </div>
                <MetricCard label="Conflict Probability" value={ri.conflict_probability} accent="amber" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Element</p>
                    <p className="font-medium">{result.element_compatibility}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Modality</p>
                    <p className="font-medium">{result.modality_interaction}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension Bar Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Dimension Scores</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart layout="vertical" data={dims(result)} margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#52525b", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} width={90} />
                  <Tooltip
                    formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(1)}%`, "Score"]}
                    contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1000}>
                    {dims(result).map((d) => (
                      <Cell key={d.name} fill={DIM_COLORS[d.name] ?? "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strengths + Risks */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                <h3 className="text-sm font-semibold text-green-400 mb-3">Top Strengths</h3>
                <ol className="space-y-2">
                  {ri.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500 font-bold">{i + 1}.</span>
                      <span className="text-zinc-200">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">Risk Areas</h3>
                <ol className="space-y-2">
                  {ri.risks.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500 font-bold">{i + 1}.</span>
                      <span className="text-zinc-200">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Love Style + Love Language highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label={`${names.a} Love Style`}  value={result.love_style.a_love_style.dominant_style}  unit="" accent="orange" />
              <MetricCard label={`${names.b} Love Style`}  value={result.love_style.b_love_style.dominant_style}  unit="" accent="orange" />
              <MetricCard label={`${names.a} Love Lang.`}  value={result.love_language.a_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
              <MetricCard label={`${names.b} Love Lang.`}  value={result.love_language.b_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
            </div>

            {/* Trait Radar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Trait Comparison</h2>
              <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />
            </div>

            {/* Behavioral Map */}
            <BehavioralMap aTraits={result.a_traits} bTraits={result.b_traits} nameA={names.a} nameB={names.b} />

            {/* Gemini Narrative */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300">AI Interpretation</h2>
              {(["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const).map((key) => (
                <div key={key} className="border-l-2 border-white/10 pl-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.analysis[key]}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
