"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

interface LoveLanguageProfile {
  words_of_affirmation: number;
  acts_of_service: number;
  receiving_gifts: number;
  quality_time: number;
  physical_touch: number;
  primary_language: string;
}

interface LoveLanguageResult {
  a_love_language: LoveLanguageProfile;
  b_love_language: LoveLanguageProfile;
  love_language_compatibility_score: number;
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
}

const LANG_KEYS = [
  "words_of_affirmation", "acts_of_service", "receiving_gifts", "quality_time", "physical_touch",
] as const;

const LANG_LABELS: Record<string, string> = {
  words_of_affirmation: "Words",
  acts_of_service: "Acts",
  receiving_gifts: "Gifts",
  quality_time: "Time",
  physical_touch: "Touch",
};

export default function LoveLanguagePage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<LoveLanguageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true); setError("");
    try {
      setResult(await apiFetch<LoveLanguageResult>("/analyze/love-language", pairBody(a, b)));
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };

  const chartData = result
    ? LANG_KEYS.map((k) => ({
        lang: LANG_LABELS[k],
        [names.a]: result.a_love_language[k],
        [names.b]: result.b_love_language[k],
      }))
    : [];

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Love Language</h1>
        <p className="text-zinc-500 mt-1 text-sm">Words, Acts, Gifts, Time, Touch alignment</p>
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
        {loading ? "Analyzing…" : "Analyze Love Languages"}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            {/* Score + primary languages */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.love_language_compatibility_score} size={160} label="Language Alignment" color="#14b8a6" />
              <div className="grid grid-cols-2 gap-3 flex-1">
                <MetricCard
                  label={`${names.a} Primary`}
                  value={result.a_love_language.primary_language.replace(/_/g, " ")}
                  unit="" accent="teal"
                />
                <MetricCard
                  label={`${names.b} Primary`}
                  value={result.b_love_language.primary_language.replace(/_/g, " ")}
                  unit="" accent="teal"
                />
              </div>
            </div>

            {/* Grouped bar chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Love Language Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#52525b", fontSize: 11 }} />
                  <YAxis type="category" dataKey="lang" tick={{ fill: "#a1a1aa", fontSize: 12 }} width={50} />
                  <Tooltip
                    formatter={(v: number | undefined) => `${(v ?? 0).toFixed(1)}`}
                    contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey={names.a} fill="rgba(255,255,255,0.65)" radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey={names.b} fill="#3b82f6"               radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
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
                <div key={key} className="border-l-2 border-teal-500/30 pl-4">
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
