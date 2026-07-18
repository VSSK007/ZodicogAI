"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { PersonData, emptyPerson, validatePerson, apiFetch } from "@/lib/api";
import AnalyzeSkeleton from "@/components/AnalyzeSkeleton";
import ShareImageButton from "@/components/ShareImageButton";
import { SIGN_SYMBOL, SIGN_COLOR } from "@/lib/celebrities";

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
    person_a_gender: a.gender,
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

function renderMd(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
      <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">{children}</span>
    </div>
  );
}

function AIHeader() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
      <div className="relative w-2 h-2 shrink-0">
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
        <div className="w-2 h-2 rounded-full bg-accent" />
      </div>
      <span className="text-xs font-semibold text-zinc-300 tracking-wide">AI Interpretation</span>
      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-bright/80 border border-accent/20">
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

  const [submittedAsPair, setSubmittedAsPair] = useState(false);

  // Both modes use the JSON endpoint: solo returns 9 structured fields,
  // pair returns 5 engine scores + the full 7-field reading. (The old pair
  // path streamed free prose from a prompt fed placeholder metrics, then
  // discarded it when scores arrived — pairs never saw a real reading.)
  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    if (errA) return setError(errA);
    if (showB) {
      const errB = validatePerson(b, "Person B");
      if (errB) return setError(errB);
    }
    setLoading(true);
    setError("");
    setResult(null);
    setSubmittedAsPair(showB);

    try {
      const body = showB ? pairSexBody(a, b) : soloBody(a);
      const data = await apiFetch<SextrologyResult>("/analyze/sextrology", body);
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
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

      {!result && (<>
        <div className={`grid gap-4 mb-4 ${showB ? "md:grid-cols-2" : ""}`}>
          <PersonForm label="Person A" value={a} onChange={setA} />
          {showB && <PersonForm label="Person B" value={b} onChange={setB} />}
        </div>

        <button
          onClick={() => { setShowB((v) => !v); setResult(null); }}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition mb-6 underline underline-offset-2"
        >
          {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for compatibility"}
        </button>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit} disabled={loading}
          className="w-full py-3.5 md:py-3 rounded-control text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
        >
          {loading ? "Analyzing…" : showB ? "Analyze Intimacy Compatibility" : "Reveal Your Sextrology Profile"}
        </button>

        {loading && <AnalyzeSkeleton variant={showB ? "pair" : "solo"} />}
      </>)}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4 md:space-y-6">

            <button onClick={() => setResult(null)} className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>Try another reading</button>

            {(submittedAsPair || isPair(result)) ? (
              (() => { const pr = result as PairResult; return (
              <>
                {/* Pair — score ring */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={CARD}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#6366f1]/60 via-[#6366f1]/20 to-transparent" />
                  <div className="p-5 md:p-8">
                    <div className="flex justify-end mb-4">
                      <ShareImageButton data={{
                        type: "compat",
                        nameA: names.a, nameB: names.b,
                        signA: getSign(a.month, a.day), symbolA: SIGN_SYMBOL[getSign(a.month, a.day)] ?? "✦", colorA: SIGN_COLOR[getSign(a.month, a.day)] ?? "#f59e0b",
                        signB: getSign(b.month, b.day), symbolB: SIGN_SYMBOL[getSign(b.month, b.day)] ?? "✦", colorB: SIGN_COLOR[getSign(b.month, b.day)] ?? "#818cf8",
                        score: pr.sexual_compatibility_score,
                      }} />
                    </div>
                    <div className="flex justify-center">
                      <ScoreRing score={pr.sexual_compatibility_score} size={180} label="Intimacy Score" color="#6366f1" />
                    </div>
                  </div>
                </motion.div>

                {/* Pair — metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                  className="grid grid-cols-2 gap-2 md:gap-3"
                >
                  <MetricCard label="Intensity Alignment"        value={pr.intimacy_intensity_alignment}          accent="indigo" />
                  <MetricCard label="Pacing Alignment"           value={pr.intimacy_pacing_alignment}             accent="indigo" />
                  <MetricCard label="Dominance Polarity"         value={pr.dominance_receptiveness_polarity}      accent="indigo" />
                  <MetricCard label="Emotional–Physical Balance" value={pr.emotional_physical_balance_similarity} accent="indigo" />
                </motion.div>

                {/* Pair — radar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
                  className={CARD}
                >
                  <div className="h-0.5 bg-gradient-to-r from-accent/50 via-gold/20 to-transparent" />
                  <div className="p-4 md:p-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-4">Trait Comparison</h2>
                    <TraitRadar a={pr.a_traits} b={pr.b_traits} nameA={names.a} nameB={names.b} />
                  </div>
                </motion.div>

                {/* Pair — full sextrology reading (7 fields, same depth as solo) */}
                {result.analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
                  className={CARD}
                >
                  <AIHeader />
                  <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                    <h2 className="text-sm font-semibold text-zinc-300">Sextrology Reading</h2>
                    {PAIR_FIELDS.map(({ key, label, icon }) => (
                      <div key={key} className="border-l-2 border-gold/40 md:border-indigo-500/40 pl-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                          <span className="mr-1.5">{icon}</span>{label}
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{renderMd((pr.analysis as unknown as Record<string,string>)?.[key] ?? "")}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
                )}
              </>
            ); })()) : (
              (() => { const sr = result as SoloResult; return (
              <>
                {/* Solo — all fields */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={CARD}
                >
                  <AIHeader />
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm font-semibold text-zinc-300">Sextrology Profile</h2>
                      <div className="flex gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 md:bg-indigo-500/10 text-gold-bright md:text-indigo-300 border border-gold/20 md:border-indigo-500/20">{sr.sign}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.07]">{sr.mbti_type}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      {SOLO_FIELDS.map(({ key, label, icon }) => (
                        <div key={key} className="border-l-2 border-gold/40 md:border-indigo-500/40 pl-4">
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                            <span className="mr-1.5">{icon}</span>{label}
                          </p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(sr.analysis?.[key] ?? "")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            ); })())}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
