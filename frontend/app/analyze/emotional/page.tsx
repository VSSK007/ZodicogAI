"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import ConstellationStream from "@/components/ConstellationStream";
import { renderMd } from "@/lib/renderMd";
import { PersonData, emptyPerson, validatePerson, pairBody } from "@/lib/api";
import AnalyzeSkeleton from "@/components/AnalyzeSkeleton";
import ShareImageButton from "@/components/ShareImageButton";
import { SIGN_SYMBOL, SIGN_COLOR } from "@/lib/celebrities";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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

const CARD = "bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden";

function getSign(month: number, day: number): string {
  const d = month * 100 + day;
  if (d >= 321 && d <= 419) return "aries";
  if (d >= 420 && d <= 520) return "taurus";
  if (d >= 521 && d <= 620) return "gemini";
  if (d >= 621 && d <= 722) return "cancer";
  if (d >= 723 && d <= 822) return "leo";
  if (d >= 823 && d <= 922) return "virgo";
  if (d >= 923 && d <= 1022) return "libra";
  if (d >= 1023 && d <= 1121) return "scorpio";
  if (d >= 1122 && d <= 1221) return "sagittarius";
  if (d >= 1222 || d <= 119) return "capricorn";
  if (d >= 120 && d <= 218) return "aquarius";
  return "pisces";
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

export default function EmotionalPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<EmotionalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamScores, setStreamScores] = useState<EmotionalResult | null>(null);

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
      const response = await fetch(`${API}/analyze/emotional/stream`, {
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
            if (parsed.error) { setError(parsed.error); setStreaming(false); setLoading(false); }
            if (parsed.done === true) {
              const scores: EmotionalResult = parsed;
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
        <h1 className="text-3xl font-bold tracking-tight">Emotional Compatibility</h1>
        <p className="text-zinc-500 mt-1 text-sm">Expression, intensity, and stability alignment</p>
      </div>

      {!result && (<>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <PersonForm label="Person A" value={a} onChange={setA} />
          <PersonForm label="Person B" value={b} onChange={setB} />
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handleStream} disabled={loading}
          className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
        >
          {loading ? "Analyzing…" : "Analyze Emotional Compatibility"}
        </button>

        {loading && !streamedText && <AnalyzeSkeleton variant="pair" />}

        {/* Streaming section */}
        <div className="mb-4 md:mb-5">
          <ConstellationStream
            text={streamedText}
            streaming={streaming}
            visible={!!streamedText}
          />
        </div>
      </>)}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4 md:space-y-5">

            <button onClick={() => setResult(null)} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>Try again</button>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className={CARD}
            >
              <div className="h-0.5 bg-gradient-to-r from-[#a855f7]/60 via-[#a855f7]/20 to-transparent" />
              <div className="p-5 md:p-8">
                <div className="flex justify-end mb-4">
                  <ShareImageButton data={{
                    type: "compat",
                    nameA: names.a, nameB: names.b,
                    signA: getSign(a.month, a.day), symbolA: SIGN_SYMBOL[getSign(a.month, a.day)] ?? "✦", colorA: SIGN_COLOR[getSign(a.month, a.day)] ?? "#f59e0b",
                    signB: getSign(b.month, b.day), symbolB: SIGN_SYMBOL[getSign(b.month, b.day)] ?? "✦", colorB: SIGN_COLOR[getSign(b.month, b.day)] ?? "#818cf8",
                    score: result.emotional_compatibility_score,
                  }} />
                </div>
                <div className="flex justify-center">
                  <ScoreRing score={result.emotional_compatibility_score} size={180} label="Emotional Score" color="#a855f7" />
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3"
            >
              <MetricCard label="Expression Similarity"   value={result.emotional_expression_similarity}   accent="purple" />
              <MetricCard label="Intensity Alignment"     value={result.emotional_intensity_alignment}     accent="purple" />
              <MetricCard label="Stability Compatibility" value={result.emotional_stability_compatibility} accent="purple" />
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

            {/* AI Interpretation — hidden when ConstellationStream is showing */}
            {!streamedText && result.analysis && (
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
                  <div key={key} className="border-l-2 border-amber-500/40 md:border-purple-500/40 pl-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(result.analysis?.[key])}</p>
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
