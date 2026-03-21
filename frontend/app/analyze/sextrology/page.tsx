"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import ConstellationStream from "@/components/ConstellationStream";
import { PersonData, emptyPerson, validatePerson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface Traits { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number; }

// ── Pair result ───────────────────────────────────────────────────────────────

interface SextrologyAnalysis {
  sexual_character: string;
  foreplay: string;
  erogenous_zones: string;
  fantasies: string;
  positions_and_dynamics: string;
  emotional_needs: string;
  long_term_fire: string;
}

interface PairResult {
  intimacy_intensity_alignment: number;
  intimacy_pacing_alignment: number;
  dominance_receptiveness_polarity: number;
  emotional_physical_balance_similarity: number;
  sexual_compatibility_score: number;
  a_traits: Traits;
  b_traits: Traits;
  analysis: SextrologyAnalysis;
}

// ── Solo result ───────────────────────────────────────────────────────────────

interface SextrologySoloAnalysis {
  sexual_character: string;
  foreplay: string;
  turn_ons: string;
  turn_offs: string;
  erogenous_zones: string;
  fantasies: string;
  kink_profile: string;
  signature_positions: string;
  seduction_style: string;
}

interface SoloResult {
  name: string;
  sign: string;
  mbti_type: string;
  analysis: SextrologySoloAnalysis;
}

type SextrologyResult = PairResult | SoloResult;

function isPair(r: SextrologyResult): r is PairResult {
  return "sexual_compatibility_score" in r;
}

// ── API body helpers ──────────────────────────────────────────────────────────

function soloBody(a: PersonData) {
  return {
    person_a_name: a.name.trim(),
    person_a_day: Number(a.day),
    person_a_month: Number(a.month),
    person_a_mbti: a.mbti,
  };
}

function pairSexBody(a: PersonData, b: PersonData) {
  return {
    ...soloBody(a),
    person_b_name: b.name.trim(),
    person_b_day: Number(b.day),
    person_b_month: Number(b.month),
    person_b_mbti: b.mbti,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CARD = "bg-white/[0.03] ring-1 ring-white/10 rounded-2xl overflow-hidden";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

function AIHeader() {
  return (
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
  );
}

const SOLO_FIELDS: { key: keyof SextrologySoloAnalysis; label: string; icon: string }[] = [
  { key: "sexual_character",    label: "Sexual Character",     icon: "♦" },
  { key: "foreplay",            label: "Foreplay Style",       icon: "✧" },
  { key: "turn_ons",            label: "Turn-Ons",             icon: "✦" },
  { key: "turn_offs",           label: "Turn-Offs",            icon: "✗" },
  { key: "erogenous_zones",     label: "Erogenous Zones",      icon: "◉" },
  { key: "fantasies",           label: "Fantasies",            icon: "★" },
  { key: "kink_profile",        label: "Kink Profile",         icon: "⛓" },
  { key: "signature_positions", label: "Signature Positions",  icon: "⇄" },
  { key: "seduction_style",     label: "Seduction Style",      icon: "♡" },
];

const PAIR_FIELDS: { key: keyof SextrologyAnalysis; label: string; icon: string }[] = [
  { key: "sexual_character",       label: "Sexual Character",     icon: "♦" },
  { key: "foreplay",               label: "Foreplay Chemistry",   icon: "✧" },
  { key: "erogenous_zones",        label: "Erogenous Zones",      icon: "◉" },
  { key: "fantasies",              label: "Fantasies",            icon: "✦" },
  { key: "positions_and_dynamics", label: "Positions & Dynamics", icon: "⇄" },
  { key: "emotional_needs",        label: "Emotional Needs",      icon: "♡" },
  { key: "long_term_fire",         label: "Long-Term Fire",       icon: "🔥" },
];

export default function SextrologyPage() {
  const [a, setA] = useState<PersonData>(emptyPerson());
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [showB, setShowB] = useState(false);
  const [result, setResult] = useState<SextrologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamScores, setStreamScores] = useState<SextrologyResult | null>(null);

  async function handleStream() {
    const errA = validatePerson(a, "Person A");
    if (errA) return setError(errA);
    if (showB) {
      const errB = validatePerson(b, "Person B");
      if (errB) return setError(errB);
    }
    setLoading(true);
    setError("");
    setStreaming(true);
    setStreamedText("");
    setStreamScores(null);
    setResult(null);

    try {
      const body = showB ? pairSexBody(a, b) : soloBody(a);
      const response = await fetch(`${API}/analyze/sextrology/stream`, {
        method: "POST",
        body: JSON.stringify(body),
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
              setStreamedText((prev) => prev + parsed.chunk);
            }
            if (parsed.done === true) {
              const scores: SextrologyResult = parsed;
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
        <h1 className="text-3xl font-bold tracking-tight">Sextrology</h1>
        <p className="text-zinc-500 mt-1 text-sm">Intimacy dynamics — sexual character, fantasies, kinks, and erotic compatibility</p>
      </div>

      <div className={`grid gap-4 mb-4 ${showB ? "md:grid-cols-2" : ""}`}>
        <PersonForm label="Person A" value={a} onChange={setA} />
        {showB && <PersonForm label="Person B" value={b} onChange={setB} />}
      </div>

      <button
        onClick={() => { setShowB((v) => !v); setResult(null); setStreamedText(""); setStreamScores(null); }}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition mb-6 underline underline-offset-2"
      >
        {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for compatibility"}
      </button>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleStream} disabled={loading}
        className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
      >
        {loading ? "Analyzing…" : showB ? "Analyze Intimacy Compatibility" : "Reveal Your Sextrology Profile"}
      </button>

      {/* Streaming section */}
      <div className="mb-4 md:mb-6">
        <ConstellationStream
          text={streamedText}
          streaming={streaming}
          visible={!!streamedText}
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4 md:space-y-6">

            {isPair(result) ? (
              <>
                {/* Pair — score ring */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={CARD}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#6366f1]/60 via-[#6366f1]/20 to-transparent" />
                  <div className="p-5 md:p-8 flex justify-center">
                    <ScoreRing score={result.sexual_compatibility_score} size={180} label="Intimacy Score" color="#6366f1" />
                  </div>
                </motion.div>

                {/* Pair — metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                  className="grid grid-cols-2 gap-2 md:gap-3"
                >
                  <MetricCard label="Intensity Alignment"        value={result.intimacy_intensity_alignment}          accent="indigo" />
                  <MetricCard label="Pacing Alignment"           value={result.intimacy_pacing_alignment}             accent="indigo" />
                  <MetricCard label="Dominance Polarity"         value={result.dominance_receptiveness_polarity}      accent="indigo" />
                  <MetricCard label="Emotional–Physical Balance" value={result.emotional_physical_balance_similarity} accent="indigo" />
                </motion.div>

                {/* Pair — radar */}
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

                {/* Pair — AI reading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
                  className={CARD}
                >
                  <AIHeader />
                  <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                    <h2 className="text-sm font-semibold text-zinc-300">Sextrology Reading</h2>
                    {PAIR_FIELDS.map(({ key, label, icon }) => (
                      <div key={key} className="border-l-2 border-amber-500/40 md:border-indigo-500/40 pl-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                          <span className="mr-1.5">{icon}</span>{label}
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{result.analysis?.[key]}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                {/* Solo — identity header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={`${CARD} p-6 flex items-center gap-5`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 md:bg-indigo-500/15 border border-amber-500/25 md:border-indigo-500/25 flex items-center justify-center shrink-0">
                    <span className="text-2xl">♦</span>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Solo Profile</p>
                    <p className="text-lg font-semibold text-white">{result.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 md:bg-indigo-500/15 text-amber-300 md:text-indigo-300 border border-amber-500/25 md:border-indigo-500/25">{result.sign}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">{result.mbti_type}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Solo — all fields */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                  className={CARD}
                >
                  <AIHeader />
                  <div className="p-4 md:p-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-5">Sextrology Profile</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      {SOLO_FIELDS.map(({ key, label, icon }) => (
                        <div key={key} className="border-l-2 border-amber-500/40 md:border-indigo-500/40 pl-4">
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                            <span className="mr-1.5">{icon}</span>{label}
                          </p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{result.analysis?.[key]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
