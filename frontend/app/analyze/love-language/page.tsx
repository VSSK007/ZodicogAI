"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
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
  words_of_affirmation: "Words of Affirmation",
  acts_of_service:      "Acts of Service",
  receiving_gifts:      "Receiving Gifts",
  quality_time:         "Quality Time",
  physical_touch:       "Physical Touch",
};

const CARD = "bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

function DualBar({ label, aVal, bVal, i }: { label: string; aVal: number; bVal: number; i: number }) {
  return (
    <motion.div
      className="py-2.5 border-b border-white/[0.04] last:border-0 rounded-lg px-2 -mx-2"
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500 tabular-nums">{aVal.toFixed(0)} / {bVal.toFixed(0)}</span>
      </div>
      <div className="space-y-1">
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "#a78bfa" }}
            initial={{ width: 0 }}
            animate={{ width: `${aVal}%` }}
            transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }}
          />
        </div>
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "#2dd4bf" }}
            initial={{ width: 0 }}
            animate={{ width: `${bVal}%` }}
            transition={{ duration: 0.7, delay: i * 0.07 + 0.05, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

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

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <Eyebrow>Analysis</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">Love Language</h1>
        <p className="text-zinc-500 mt-1 text-sm">Words, Acts, Gifts, Time, Touch alignment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PersonForm label="Person A" value={a} onChange={setA} />
        <PersonForm label="Person B" value={b} onChange={setB} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={handleSubmit} disabled={loading}
        className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
      >
        {loading ? "Analyzing…" : "Analyze Love Languages"}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4 md:space-y-5">

            {/* Score + primary languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-[#14b8a6]/60 via-[#14b8a6]/20 to-transparent" />
              <div className="p-5 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-8">
                <ScoreRing score={result.love_language_compatibility_score} size={160} label="Language Alignment" color="#14b8a6" />
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <MetricCard label={`${names.a} Primary`} value={result.a_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
                  <MetricCard label={`${names.b} Primary`} value={result.b_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
                </div>
              </div>
            </motion.div>

            {/* Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-amber-500/50 md:from-[#4285f4]/50 via-amber-500/20 md:via-[#34a853]/30 to-transparent" />
              <div className="p-4 md:p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-1">Love Language Distribution</h2>
                <div className="flex gap-4 mb-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block" />{names.a}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2dd4bf] inline-block" />{names.b}
                  </span>
                </div>
                <div>
                  {LANG_KEYS.map((k, i) => (
                    <DualBar
                      key={k}
                      label={LANG_LABELS[k]}
                      aVal={result.a_love_language[k]}
                      bVal={result.b_love_language[k]}
                      i={i}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-amber-500/50 md:from-[#4285f4]/50 via-amber-500/20 md:via-[#34a853]/30 to-transparent" />
              <div className="p-4 md:p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4">Trait Comparison</h2>
                <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />
              </div>
            </motion.div>

            {/* AI Interpretation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
              className={CARD}
            >
              <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="relative w-2 h-2 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-amber-500 md:bg-[#4285f4] animate-ping opacity-60" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 md:bg-[#4285f4]" />
                </div>
                <span className="text-xs font-semibold text-zinc-300 tracking-wide">AI Interpretation</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500 md:bg-amber-500/10 md:bg-[#4285f4]/10 text-amber-400/80 md:text-[#4285f4]/80 border border-amber-500/20 md:border-[#4285f4]/20">
                  Gemini 2.5 Flash
                </span>
              </div>
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {(["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const).map((key) => (
                  <div key={key} className="border-l-2 border-amber-500/40 md:border-teal-500/40 pl-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{result.analysis[key]}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
