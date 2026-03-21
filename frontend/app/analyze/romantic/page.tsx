"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import BehavioralMap from "@/components/BehavioralMap";
import PersonForm from "@/components/PersonForm";
import ConstellationStream from "@/components/ConstellationStream";
import { PersonData, emptyPerson, validatePerson, pairBody } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

interface RomanticResult {
  attachment_pacing_similarity: number;
  affection_expression_similarity: number;
  romantic_polarity_score: number;
  romantic_compatibility_score: number;
  emotional_compatibility_score: number;
  a_traits: Traits;
  b_traits: Traits;
  analysis: { relationship_dynamic: string; communication_pattern: string; conflict_risk: string; long_term_viability: string; };
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

export default function RomanticPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<RomanticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamScores, setStreamScores] = useState<RomanticResult | null>(null);

  async function handleStream() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true);
    setError("");
    setStreaming(true);
    setStreamedText("");
    setStreamScores(null);
    setResult(null);

    try {
      const response = await fetch(`${API}/analyze/romantic/stream`, {
        method: "POST",
        body: JSON.stringify(pairBody(a, b)),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if ("chunk" in parsed) {
              setLoading(false);  // reveal animation on first chunk
              setStreamedText((prev) => prev + parsed.chunk);
            }
            if (parsed.done === true) {
              const scores: RomanticResult = parsed;
              setStreamScores(scores);
              setResult(scores);
              setStreaming(false);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (e: unknown) {
      setError((e as Error).message);
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  }

  const names = { a: a.name.trim() || "Person A", b: b.name.trim() || "Person B" };

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <Eyebrow>Analysis</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">Romantic Compatibility</h1>
        <p className="text-zinc-500 mt-1 text-sm">Attachment pacing, affection, and polarity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PersonForm label="Person A" value={a} onChange={setA} />
        <PersonForm label="Person B" value={b} onChange={setB} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={handleStream} disabled={loading}
        className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
      >
        {loading ? "Analyzing…" : "Analyze Romantic Compatibility"}
      </button>

      {/* Streaming section */}
      <div className="mb-4 md:mb-5">
        <ConstellationStream
          text={streamedText}
          streaming={streaming}
          visible={!!streamedText}
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4 md:space-y-5">

            {/* Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-[#f43f5e]/60 via-[#f43f5e]/20 to-transparent" />
              <div className="p-5 md:p-8 flex flex-wrap justify-center gap-5 md:gap-10">
                <ScoreRing score={result.romantic_compatibility_score}  size={160} label="Romantic Score"  color="#f43f5e" />
                <ScoreRing score={result.emotional_compatibility_score} size={160} label="Emotional Score" color="#a855f7" />
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3"
            >
              <MetricCard label="Attachment Pacing"    value={result.attachment_pacing_similarity}    accent="rose" />
              <MetricCard label="Affection Expression" value={result.affection_expression_similarity} accent="rose" />
              <MetricCard label="Romantic Polarity"    value={result.romantic_polarity_score}         accent="rose" />
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

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: EASE }}
            >
              <BehavioralMap aTraits={result.a_traits} bTraits={result.b_traits} nameA={names.a} nameB={names.b} />
            </motion.div>

            {/* AI Interpretation — hidden when ConstellationStream is showing */}
            {!streamedText && result.analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.36, ease: EASE }}
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
                  <div key={key} className="border-l-2 border-amber-500/40 md:border-rose-500/40 pl-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{result.analysis?.[key]}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
