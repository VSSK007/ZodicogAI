"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { renderMd } from "@/lib/renderMd";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NumerologyProfile {
  life_path_number: number;
  expression_number: number;
  lucky_number: number;
  number_title: string;
  number_core: string;
  love_note: string;
  strengths: string[];
  challenges: string[];
}

interface SingleResult {
  name: string;
  numerology: NumerologyProfile;
  analysis: {
    life_path_reading: string;
    love_and_relationships: string;
    career_and_purpose: string;
    spiritual_theme: string;
    shadow_challenge: string;
  };
}

interface NumerologyCompat {
  compatibility_score: number;
  life_path_score: number;
  expression_score: number;
  cross_score: number;
  pursue_signal: "pursue" | "caution" | "avoid";
}

interface PairResult {
  a_name: string;
  b_name: string;
  a_numerology: NumerologyProfile;
  b_numerology: NumerologyProfile;
  compatibility: NumerologyCompat;
  analysis: {
    compatibility_reading: string;
    swot_strengths: string[];
    swot_weaknesses: string[];
    swot_opportunities: string[];
    swot_threats: string[];
    pursue_or_avoid: string;
    pair_advice: string;
  };
}

type NumerologyResult = SingleResult | PairResult;

function isPair(r: NumerologyResult): r is PairResult {
  return "a_name" in r;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface SimplePersonState {
  name: string;
  day: string;
  month: string;
}

function emptySimple(): SimplePersonState {
  return { name: "", day: "", month: "" };
}

function validateSimple(p: SimplePersonState, label: string): string | null {
  if (!p.name.trim()) return `${label}: Name is required`;
  const d = Number(p.day), m = Number(p.month);
  if (!p.day || isNaN(d) || d < 1 || d > 31) return `${label}: Day must be 1–31`;
  if (!p.month || isNaN(m) || m < 1 || m > 12) return `${label}: Month must be 1–12`;
  return null;
}

const SIGNAL_STYLES: Record<string, string> = {
  pursue:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  caution: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  avoid:   "bg-red-500/20 text-red-300 border-red-500/30",
};

const SIGNAL_LABELS: Record<string, string> = {
  pursue:  "✓ Pursue",
  caution: "⚠ Proceed with Caution",
  avoid:   "✗ Avoid",
};

// ── Sub-components ────────────────────────────────────────────────────────────

const INPUT_SMALL = "bg-white/[0.04] md:bg-zinc-900 border border-amber-500/20 md:border-white/10 px-3 py-3 md:py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 md:focus:border-white/30 transition-colors text-center";

function SimpleForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SimplePersonState;
  onChange: (v: SimplePersonState) => void;
}) {
  const set =
    (key: keyof SimplePersonState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value });

  return (
    <div className="bg-white/[0.03] p-5 rounded-2xl ring-1 ring-amber-500/20 md:ring-white/10 space-y-3">
      <input
        className="w-full bg-transparent text-base font-medium placeholder:text-zinc-600 outline-none border-b border-amber-500/20 md:border-white/10 pb-2.5"
        placeholder={label}
        value={value.name}
        onChange={set("name")}
      />
      <div className="flex gap-2">
        <input className={`w-20 md:w-16 ${INPUT_SMALL}`} placeholder="Day" type="number" min={1} max={31} value={value.day} onChange={set("day")} />
        <input className={`w-20 md:w-16 ${INPUT_SMALL}`} placeholder="Mo" type="number" min={1} max={12} value={value.month} onChange={set("month")} />
      </div>
    </div>
  );
}

function NumberBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-2xl font-bold text-white">{value}</span>
      </motion.div>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}

function NarrativeSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l-2 border-white/20 pl-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(text)}</p>
    </div>
  );
}

function ScoreBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500">{value.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-white/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SwotGrid({ strengths, weaknesses, opportunities, threats }: {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}) {
  const quadrant = (title: string, items: string[], accent: string, bg: string) => (
    <div className={`rounded-xl p-4 ${bg}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${accent}`}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 items-start text-sm text-zinc-300">
            <span className={`shrink-0 mt-0.5 ${accent}`}>•</span>
            <span>{renderMd(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrant("Strengths", strengths, "text-emerald-400", "bg-emerald-500/5 border border-emerald-500/20")}
      {quadrant("Weaknesses", weaknesses, "text-red-400", "bg-red-500/5 border border-red-500/20")}
      {quadrant("Opportunities", opportunities, "text-blue-400", "bg-blue-500/5 border border-blue-500/20")}
      {quadrant("Threats", threats, "text-amber-400", "bg-amber-500/5 border border-amber-500/20")}
    </div>
  );
}

function ProfileCard({ profile, name }: { profile: NumerologyProfile; name: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{name}</p>
          <p className="font-semibold text-white mt-0.5">{profile.number_title}</p>
          <p className="text-xs text-zinc-400 mt-1">{profile.number_core}</p>
        </div>
        <div className="flex gap-2">
          <NumberBadge value={profile.life_path_number} label="Life Path" />
          <NumberBadge value={profile.lucky_number} label="Lucky" />
        </div>
      </div>
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Strengths</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.strengths.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-zinc-300 border border-white/10">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Challenges</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.challenges.map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300/80 border border-red-500/20">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NumerologyPage() {
  const [a, setA] = useState<SimplePersonState>(emptySimple());
  const [b, setB] = useState<SimplePersonState>(emptySimple());
  const [showB, setShowB] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const errA = validateSimple(a, "Person A");
    if (errA) return setError(errA);
    if (showB) {
      const errB = validateSimple(b, "Person B");
      if (errB) return setError(errB);
    }
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        person_a_name: a.name.trim(),
        person_a_day: Number(a.day),
        person_a_month: Number(a.month),
      };
      if (showB && b.name.trim()) {
        body.person_b_name = b.name.trim();
        body.person_b_day = Number(b.day);
        body.person_b_month = Number(b.month);
      }
      setResult(await apiFetch<NumerologyResult>("/analyze/numerology", body));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Analysis</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Numerology</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Life path numbers, lucky numbers, SWOT compatibility, and pursue-or-avoid verdicts
        </p>
      </div>

      {/* Forms */}
      <div className={`grid gap-4 mb-4 ${showB ? "md:grid-cols-2" : ""}`}>
        <SimpleForm label="Person A" value={a} onChange={setA} />
        {showB && <SimpleForm label="Person B" value={b} onChange={setB} />}
      </div>

      <button
        onClick={() => { setShowB((v) => !v); setResult(null); }}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition mb-6 underline underline-offset-2"
      >
        {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for compatibility"}
      </button>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
      >
        {loading ? "Calculating the numbers…" : "Reveal Numerology"}
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 md:space-y-8"
          >
            {isPair(result) ? (
              <>
                {/* Profiles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <ProfileCard profile={result.a_numerology} name={result.a_name} />
                  <ProfileCard profile={result.b_numerology} name={result.b_name} />
                </div>

                {/* Compatibility scores + signal */}
                <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-sm font-semibold text-zinc-300">Numerology Compatibility</h2>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                        SIGNAL_STYLES[result.compatibility.pursue_signal]
                      }`}
                    >
                      {SIGNAL_LABELS[result.compatibility.pursue_signal]}
                    </span>
                  </div>
                  {/* Overall score large display */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      {result.compatibility.compatibility_score.toFixed(0)}
                    </span>
                    <span className="text-xl text-zinc-500">%</span>
                    <span className="text-sm text-zinc-500 ml-1">overall compatibility</span>
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="Life Path Match" value={result.compatibility.life_path_score} delay={0} />
                    <ScoreBar label="Expression Match" value={result.compatibility.expression_score} delay={0.1} />
                    <ScoreBar label="Cross-Pair Synergy" value={result.compatibility.cross_score} delay={0.2} />
                  </div>
                </div>

                {/* SWOT */}
                <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-zinc-300">SWOT Analysis</h2>
                  <SwotGrid
                    strengths={result.analysis.swot_strengths}
                    weaknesses={result.analysis.swot_weaknesses}
                    opportunities={result.analysis.swot_opportunities}
                    threats={result.analysis.swot_threats}
                  />
                </div>

                {/* Narratives */}
                <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-zinc-300">AI Numerology Reading</h2>
                  <NarrativeSection title="Compatibility Reading" text={result.analysis.compatibility_reading} />
                  <NarrativeSection title="Pursue or Avoid" text={result.analysis.pursue_or_avoid} />
                  <NarrativeSection title="Pair Advice" text={result.analysis.pair_advice} />
                </div>
              </>
            ) : (
              <>
                {/* Single: number display + narratives */}
                <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-4">{result.name}&apos;s Numerology Profile</h2>
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="flex gap-4">
                      <NumberBadge value={result.numerology.life_path_number} label="Life Path" />
                      <NumberBadge value={result.numerology.expression_number} label="Expression" />
                      <NumberBadge value={result.numerology.lucky_number} label="Lucky" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{result.numerology.number_title}</p>
                      <p className="text-sm text-zinc-400 mt-1">{result.numerology.number_core}</p>
                      <p className="text-xs text-zinc-500 mt-2 italic">{result.numerology.love_note}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.numerology.strengths.map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-zinc-300 border border-white/10">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Challenges</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.numerology.challenges.map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300/80 border border-red-500/20">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-zinc-300">AI Numerology Reading</h2>
                  <NarrativeSection title="Life Path Reading" text={result.analysis.life_path_reading} />
                  <NarrativeSection title="Love & Relationships" text={result.analysis.love_and_relationships} />
                  <NarrativeSection title="Career & Purpose" text={result.analysis.career_and_purpose} />
                  <NarrativeSection title="Spiritual Theme" text={result.analysis.spiritual_theme} />
                  <NarrativeSection title="Shadow Challenge" text={result.analysis.shadow_challenge} />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
