"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

interface EmotionalResult {
  emotional_expression_similarity: number;
  emotional_intensity_alignment: number;
  emotional_stability_compatibility: number;
  emotional_compatibility_score: number;
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
}

export default function EmotionalPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<EmotionalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true); setError("");
    try {
      setResult(await apiFetch<EmotionalResult>("/analyze/emotional", pairBody(a, b)));
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Emotional Compatibility</h1>
        <p className="text-zinc-500 mt-1 text-sm">Expression, intensity, and stability alignment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PersonForm label="Person A" value={a} onChange={setA} />
        <PersonForm label="Person B" value={b} onChange={setB} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={handleSubmit} disabled={loading}
        className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-40 transition mb-12"
      >
        {loading ? "Analyzing…" : "Analyze Emotional Compatibility"}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            {/* Score */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 flex justify-center">
              <ScoreRing score={result.emotional_compatibility_score} size={180} label="Emotional Score" color="#a855f7" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricCard label="Expression Similarity"   value={result.emotional_expression_similarity}   accent="purple" />
              <MetricCard label="Intensity Alignment"     value={result.emotional_intensity_alignment}     accent="purple" />
              <MetricCard label="Stability Compatibility" value={result.emotional_stability_compatibility} accent="purple" />
            </div>

            {/* Radar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Trait Comparison</h2>
              <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />
            </div>

            {/* Narrative */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300">AI Interpretation</h2>
              {(["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const).map((key) => (
                <div key={key} className="border-l-2 border-purple-500/30 pl-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
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
