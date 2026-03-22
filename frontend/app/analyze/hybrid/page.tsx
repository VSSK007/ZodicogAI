"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { renderMd } from "@/lib/renderMd";
import { PersonData, emptyPerson, validatePerson, apiFetch } from "@/lib/api";

interface HybridResult {
  name: string;
  zodiac_profile: {
    sign: string;
    element: string;
    modality: string;
    trait_vector: {
      intensity: number;
      stability: number;
      expressiveness: number;
      dominance: number;
      adaptability: number;
    };
  };
  mbti_profile: {
    type: string;
    role_group: string;
    cognitive_stack?: string;
  };
  analysis: {
    behavioral_core: string;
    emotional_pattern: string;
    decision_making_style: string;
    social_dynamic: string;
    conflict_style: string;
    leadership_tendency: string;
    strengths: string[];
    growth_edges: string[];
  };
}

const CARD = "bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

export default function HybridPage() {
  const [person, setPerson] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<HybridResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const err = validatePerson(person, "Your Profile");
    if (err) return setError(err);
    setLoading(true);
    setError("");
    try {
      setResult(await apiFetch<HybridResult>("/hybrid-analysis", {
        name: person.name.trim(),
        day: person.day,
        month: person.month,
        mbti: person.mbti,
        gender: person.gender,
      }));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const name = person.name.trim() || "You";
  const zodiac = result?.zodiac_profile;
  const mbtiProf = result?.mbti_profile;
  const analysis = result?.analysis;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <Eyebrow>Self Analysis</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">Behavioral Intelligence Profile</h1>
        <p className="text-zinc-500 mt-1 text-sm">Zodiac + MBTI deep analysis</p>
      </div>

      <div className="mb-6">
        <PersonForm label="Your Profile" value={person} onChange={setPerson} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
      >
        {loading ? "Analyzing…" : "Analyze Your Profile"}
      </button>

      <AnimatePresence>
        {result && zodiac && mbtiProf && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 md:space-y-5"
          >
            {/* Zodiac + MBTI Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-500/20 to-transparent" />
              <div className="p-5 md:p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Zodiac</p>
                    <p className="text-2xl font-bold text-amber-200">{zodiac.sign}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {zodiac.element} · {zodiac.modality}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">MBTI Type</p>
                    <p className="text-2xl font-bold text-blue-300">{mbtiProf.type}</p>
                    <p className="text-xs text-zinc-400 mt-1">{mbtiProf.role_group}</p>
                  </div>
                </div>
                {mbtiProf.cognitive_stack && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cognitive Stack</p>
                    <p className="text-sm text-zinc-300">{mbtiProf.cognitive_stack}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Trait Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-amber-500/50 md:from-[#4285f4]/50 via-amber-500/20 md:via-[#34a853]/30 to-transparent" />
              <div className="p-4 md:p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4">Behavioral Trait Profile</h2>
                <TraitRadar
                  a={zodiac.trait_vector}
                  b={undefined}
                  nameA={name}
                  nameB={undefined}
                />
              </div>
            </motion.div>

            {/* AI Interpretation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              className={CARD}
            >
              <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="relative w-2 h-2 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-amber-500 md:bg-[#4285f4] animate-ping opacity-60" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 md:bg-[#4285f4]" />
                </div>
                <span className="text-xs font-semibold text-zinc-300 tracking-wide">Behavioral Analysis</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 md:bg-[#4285f4]/10 text-amber-400/80 md:text-[#4285f4]/80 border border-amber-500/20 md:border-[#4285f4]/20">
                  Gemini 2.5 Flash
                </span>
              </div>
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {(
                  [
                    ["behavioral_core",       "Behavioral Core"],
                    ["emotional_pattern",     "Emotional Pattern"],
                    ["decision_making_style", "Decision Style"],
                    ["social_dynamic",        "Social Dynamic"],
                    ["conflict_style",        "Conflict Style"],
                    ["leadership_tendency",   "Leadership"],
                  ] as [keyof typeof analysis, string][]
                ).map(([key, label]) => (
                  <div key={key} className="border-l-2 border-amber-500/40 pl-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(analysis[key] as string)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strengths + Growth Edges */}
            {(analysis.strengths?.length > 0 || analysis.growth_edges?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-3">Strengths</p>
                  <ul className="space-y-1.5">
                    {(analysis.strengths ?? []).map((s, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{renderMd(s)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-3">Growth Edges</p>
                  <ul className="space-y-1.5">
                    {(analysis.growth_edges ?? []).map((s, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-amber-500 mt-0.5 shrink-0">→</span>{renderMd(s)}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
