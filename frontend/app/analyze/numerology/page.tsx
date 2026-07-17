"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { renderMd } from "@/lib/renderMd";
import ShareImageButton from "@/components/ShareImageButton";
import AnalyzePageShell from "@/components/analyze/AnalyzePageShell";
import { SimpleForm, emptySimple, validateSimple, type SimplePersonState } from "@/components/ui/SimpleForm";
import { Button } from "@/components/ui/Button";
import { AIHeader } from "@/components/ui/AIHeader";
import { Card } from "@/components/ui/Card";
import ResultActions from "@/components/analyze/ResultActions";

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

const SIGNAL_STYLES: Record<string, string> = {
  pursue:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  caution: "bg-gold/20 text-gold-bright border-hairline-gold",
  avoid:   "bg-red-500/20 text-red-300 border-red-500/30",
};

const SIGNAL_LABELS: Record<string, string> = {
  pursue:  "✓ Pursue",
  caution: "⚠ Proceed with Caution",
  avoid:   "✗ Avoid",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function NumberBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="size-16 rounded-card bg-gold/10 border border-hairline-gold flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="font-display text-2xl font-extrabold text-gold-bright">{value}</span>
      </motion.div>
      <span className="text-[10px] text-ink-muted uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}

function NarrativeSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l-2 border-accent/50 pl-4">
      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(text)}</p>
    </div>
  );
}

function ScoreBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-muted font-mono tabular-nums">{value.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-gold-bright))" }}
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
    <div className={`rounded-control p-4 ${bg}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${accent}`}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 items-start text-sm text-ink-secondary">
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
      {quadrant("Opportunities", opportunities, "text-sky-400", "bg-sky-500/5 border border-sky-500/20")}
      {quadrant("Threats", threats, "text-gold-bright", "bg-gold/5 border border-hairline-gold")}
    </div>
  );
}

function ProfileCard({ profile, name }: { profile: NumerologyProfile; name: string }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wider">{name}</p>
          <p className="font-semibold text-ink mt-0.5">{profile.number_title}</p>
          <p className="text-xs text-ink-secondary mt-1">{profile.number_core}</p>
        </div>
        <div className="flex gap-2">
          <NumberBadge value={profile.life_path_number} label="Life Path" />
          <NumberBadge value={profile.lucky_number} label="Lucky" />
        </div>
      </div>
      <div>
        <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-1.5">Strengths</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.strengths.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-ink-secondary border border-hairline">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-1.5">Challenges</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.challenges.map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300/80 border border-red-500/20">{c}</span>
          ))}
        </div>
      </div>
    </Card>
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
    <AnalyzePageShell
      eyebrow="Analysis"
      title="Numerology"
      description="Life path numbers, lucky numbers, SWOT compatibility, and pursue-or-avoid verdicts."
      hasResult={!!result}
      loading={loading}
      skeletonVariant="solo"
      error={error}
      onRetry={handleSubmit}
      onReset={() => setResult(null)}
      form={
        <>
          <div className={`grid gap-4 mb-4 ${showB ? "md:grid-cols-2" : ""}`}>
            <SimpleForm label="Person A" value={a} onChange={setA} />
            {showB && <SimpleForm label="Person B" value={b} onChange={setB} />}
          </div>

          <button
            onClick={() => { setShowB((v) => !v); setResult(null); }}
            className="text-xs text-ink-muted hover:text-ink-secondary transition mb-6 underline underline-offset-2 tap-highlight-none"
          >
            {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for compatibility"}
          </button>

          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
            {loading ? "Calculating the numbers…" : "Reveal Numerology"}
          </Button>
        </>
      }
      result={
        result && (
          <div className="space-y-4 md:space-y-8">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <ResultActions
                analysisType={isPair(result) ? "numerology_pair_analysis" : "numerology_analysis"}
                title={isPair(result) ? `${result.a_name} × ${result.b_name} Numerology Match` : `${result.name}'s Numerology`}
                payload={result}
              />
              {isPair(result)
                ? <ShareImageButton data={{ type: "numerology-pair", nameA: result.a_name, nameB: result.b_name, lifePathA: result.a_numerology.life_path_number, lifePathB: result.b_numerology.life_path_number, score: result.compatibility.compatibility_score }} />
                : <ShareImageButton data={{ type: "numerology", name: result.name, lifePath: result.numerology.life_path_number, expression: result.numerology.expression_number, lucky: result.numerology.lucky_number, numberTitle: result.numerology.number_title }} />
              }
            </div>

            {isPair(result) ? (
              <>
                {/* Profiles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <ProfileCard profile={result.a_numerology} name={result.a_name} />
                  <ProfileCard profile={result.b_numerology} name={result.b_name} />
                </div>

                {/* Compatibility scores + signal */}
                <Card variant="featured" className="p-6 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-sm font-semibold text-ink-secondary">Numerology Compatibility</h2>
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
                    <span className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink">
                      {result.compatibility.compatibility_score.toFixed(0)}
                    </span>
                    <span className="text-xl text-ink-muted">%</span>
                    <span className="text-sm text-ink-muted ml-1">overall compatibility</span>
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="Life Path Match" value={result.compatibility.life_path_score} delay={0} />
                    <ScoreBar label="Expression Match" value={result.compatibility.expression_score} delay={0.1} />
                    <ScoreBar label="Cross-Pair Synergy" value={result.compatibility.cross_score} delay={0.2} />
                  </div>
                </Card>

                {/* SWOT */}
                <Card className="p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-ink-secondary">SWOT Analysis</h2>
                  <SwotGrid
                    strengths={result.analysis.swot_strengths}
                    weaknesses={result.analysis.swot_weaknesses}
                    opportunities={result.analysis.swot_opportunities}
                    threats={result.analysis.swot_threats}
                  />
                </Card>

                {/* Narratives */}
                <Card className="p-6 space-y-5">
                  <AIHeader label="AI Numerology Reading" />
                  <NarrativeSection title="Compatibility Reading" text={result.analysis.compatibility_reading} />
                  <NarrativeSection title="Pursue or Avoid" text={result.analysis.pursue_or_avoid} />
                  <NarrativeSection title="Pair Advice" text={result.analysis.pair_advice} />
                </Card>
              </>
            ) : (
              <>
                {/* Single: number display + narratives */}
                <Card className="p-6">
                  <h2 className="text-sm font-semibold text-ink-secondary mb-4">{result.name}&apos;s Numerology Profile</h2>
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="flex gap-4">
                      <NumberBadge value={result.numerology.life_path_number} label="Life Path" />
                      <NumberBadge value={result.numerology.expression_number} label="Expression" />
                      <NumberBadge value={result.numerology.lucky_number} label="Lucky" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{result.numerology.number_title}</p>
                      <p className="text-sm text-ink-secondary mt-1">{result.numerology.number_core}</p>
                      <p className="text-xs text-ink-muted mt-2 italic">{result.numerology.love_note}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.numerology.strengths.map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-ink-secondary border border-hairline">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-2">Challenges</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.numerology.challenges.map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300/80 border border-red-500/20">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-5">
                  <AIHeader label="AI Numerology Reading" />
                  <NarrativeSection title="Life Path Reading" text={result.analysis.life_path_reading} />
                  <NarrativeSection title="Love & Relationships" text={result.analysis.love_and_relationships} />
                  <NarrativeSection title="Career & Purpose" text={result.analysis.career_and_purpose} />
                  <NarrativeSection title="Spiritual Theme" text={result.analysis.spiritual_theme} />
                  <NarrativeSection title="Shadow Challenge" text={result.analysis.shadow_challenge} />
                </Card>
              </>
            )}
          </div>
        )
      }
    />
  );
}
