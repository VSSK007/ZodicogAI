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

interface LoveStyleProfile {
  eros: number; storge: number; ludus: number; mania: number; pragma: number; agape: number;
  dominant_style: string;
}

interface LoveStyleResult {
  a_love_style: LoveStyleProfile;
  b_love_style: LoveStyleProfile;
  love_style_compatibility_score: number;
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
}

const STYLES_LIST = ["eros", "storge", "ludus", "mania", "pragma", "agape"] as const;
const STYLE_DESCRIPTIONS: Record<string, string> = {
  eros: "Passionate", storge: "Friendship", ludus: "Playful",
  mania: "Obsessive",  pragma: "Practical",  agape: "Selfless",
};

export default function LoveStylePage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<LoveStyleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true); setError("");
    try {
      setResult(await apiFetch<LoveStyleResult>("/analyze/love-style", pairBody(a, b)));
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };

  const chartData = result
    ? STYLES_LIST.map((s) => ({
        style: STYLE_DESCRIPTIONS[s],
        [names.a]: result.a_love_style[s],
        [names.b]: result.b_love_style[s],
      }))
    : [];

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Love Style</h1>
        <p className="text-zinc-500 mt-1 text-sm">Eros, Storge, Ludus, Mania, Pragma, Agape profiles</p>
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
        {loading ? "Analyzing…" : "Analyze Love Styles"}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            {/* Score + dominant styles */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.love_style_compatibility_score} size={160} label="Style Compatibility" color="#f97316" />
              <div className="grid grid-cols-2 gap-3 flex-1">
                <MetricCard label={`${names.a} Style`} value={result.a_love_style.dominant_style} unit="" accent="orange" />
                <MetricCard label={`${names.b} Style`} value={result.b_love_style.dominant_style} unit="" accent="orange" />
              </div>
            </div>

            {/* Grouped bar chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Love Style Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#52525b", fontSize: 11 }} />
                  <YAxis type="category" dataKey="style" tick={{ fill: "#a1a1aa", fontSize: 12 }} width={76} />
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
                <div key={key} className="border-l-2 border-orange-500/30 pl-4">
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
