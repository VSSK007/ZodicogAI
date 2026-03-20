"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, apiFetch } from "@/lib/api";

interface Traits {
  intensity: number;
  stability: number;
  expressiveness: number;
  dominance: number;
  adaptability: number;
}

interface HybridResult {
  zodiac_sign: string;
  zodiac_element: string;
  zodiac_modality: string;
  mbti_type: string;
  mbti_role_group: string;
  mbti_cognitive_stack: string;
  traits: Traits;
  analysis: {
    behavioral_core: string;
    emotional_pattern: string;
    social_dynamic: string;
    relationship_pattern: string;
    strength_vector: string;
    shadow_expression: string;
  };
}

const CARD = "bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#4285f4]" />
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
      setResult(await apiFetch<HybridResult>("/hybrid-analysis", { person_a: person }));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const name = person.name.trim() || "You";

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
        {result && (
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
                    <p className="text-2xl font-bold text-amber-200">{result.zodiac_sign}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {result.zodiac_element} · {result.zodiac_modality}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">MBTI Type</p>
                    <p className="text-2xl font-bold text-blue-300">{result.mbti_type}</p>
                    <p className="text-xs text-zinc-400 mt-1">{result.mbti_role_group}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cognitive Stack</p>
                  <p className="text-sm text-zinc-300">{result.mbti_cognitive_stack}</p>
                </div>
              </div>
            </motion.div>

            {/* Trait Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-[#4285f4]/50 via-[#34a853]/30 to-transparent" />
              <div className="p-4 md:p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4">Behavioral Trait Profile</h2>
                <TraitRadar
                  a={result.traits}
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
                  <div className="absolute inset-0 rounded-full bg-[#4285f4] animate-ping opacity-60" />
                  <div className="w-2 h-2 rounded-full bg-[#4285f4]" />
                </div>
                <span className="text-xs font-semibold text-zinc-300 tracking-wide">Behavioral Analysis</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4285f4]/10 text-[#4285f4]/80 border border-[#4285f4]/20">
                  Gemini 2.5 Flash
                </span>
              </div>
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {(
                  [
                    "behavioral_core",
                    "emotional_pattern",
                    "social_dynamic",
                    "relationship_pattern",
                    "strength_vector",
                    "shadow_expression",
                  ] as const
                ).map((key) => (
                  <div key={key} className="border-l-2 border-amber-500/40 pl-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, " ")}
                    </p>
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
