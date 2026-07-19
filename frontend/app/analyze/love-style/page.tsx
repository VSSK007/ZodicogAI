"use client";

import { useState } from "react";
import PersonForm from "@/components/PersonForm";
import TraitRadar from "@/components/TraitRadar";
import { renderMd } from "@/lib/renderMd";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";
import ShareImageButton from "@/components/ShareImageButton";
import { SIGN_SYMBOL, SIGN_COLOR } from "@/lib/celebrities";
import { getSign } from "@/lib/zodiac";
import AnalyzePageShell from "@/components/analyze/AnalyzePageShell";
import ResultActions from "@/components/analyze/ResultActions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AIHeader } from "@/components/ui/AIHeader";
import { DualBar } from "@/components/ui/DualBar";
import ScoreRing from "@/components/ScoreRing";
import MetricCard from "@/components/MetricCard";

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
const STYLE_LABELS: Record<string, string> = {
  eros: "Eros — Passionate", storge: "Storge — Friendship", ludus: "Ludus — Playful",
  mania: "Mania — Obsessive", pragma: "Pragma — Practical", agape: "Agape — Selfless",
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

  return (
    <AnalyzePageShell
      eyebrow="Analysis"
      title="Love Style"
      description="Eros, Storge, Ludus, Mania, Pragma, Agape profiles."
      hasResult={!!result}
      loading={loading}
      skeletonVariant="pair"
      error={error}
      onRetry={handleSubmit}
      onReset={() => setResult(null)}
      form={
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <PersonForm label="Person A" value={a} onChange={setA} />
            <PersonForm label="Person B" value={b} onChange={setB} />
          </div>
          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
            {loading ? "Analyzing…" : "Analyze Love Styles"}
          </Button>
        </>
      }
      result={
        result && (
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <ResultActions
                analysisType="love_style_analysis"
                title={`${names.a} × ${names.b} Love Style Match`}
                payload={result}
              />
              <ShareImageButton data={{
                type: "compat",
                nameA: names.a, nameB: names.b,
                signA: getSign(a.day, a.month), symbolA: SIGN_SYMBOL[getSign(a.day, a.month)] ?? "✦", colorA: SIGN_COLOR[getSign(a.day, a.month)] ?? "#f59e0b",
                signB: getSign(b.day, b.month), symbolB: SIGN_SYMBOL[getSign(b.day, b.month)] ?? "✦", colorB: SIGN_COLOR[getSign(b.day, b.month)] ?? "#818cf8",
                score: result.love_style_compatibility_score,
              }} />
            </div>

            {/* Score + dominant styles */}
            <Card className="p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
                <ScoreRing score={result.love_style_compatibility_score} size={160} label="Style Compatibility" color="var(--color-gold-bright)" />
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <MetricCard label={`${names.a} Style`} value={result.a_love_style.dominant_style} unit="" accent="amber" />
                  <MetricCard label={`${names.b} Style`} value={result.b_love_style.dominant_style} unit="" accent="amber" />
                </div>
              </div>
            </Card>

            {/* Distribution */}
            <Card className="p-4 md:p-6">
              <h2 className="text-sm font-semibold text-ink-secondary mb-1">Love Style Distribution</h2>
              <div className="flex gap-4 mb-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent-bright inline-block" />{names.a}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-gold-bright inline-block" />{names.b}
                </span>
              </div>
              <div>
                {STYLES_LIST.map((s, i) => (
                  <DualBar
                    key={s}
                    label={STYLE_LABELS[s]}
                    aVal={result.a_love_style[s]}
                    bVal={result.b_love_style[s]}
                    i={i}
                  />
                ))}
              </div>
            </Card>

            {/* Radar */}
            <Card className="p-4 md:p-6">
              <h2 className="text-sm font-semibold text-ink-secondary mb-4">Trait Comparison</h2>
              <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />
            </Card>

            {/* AI Interpretation */}
            <Card>
              <AIHeader />
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {(["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const).map((key) => (
                  <div key={key} className="border-l-2 border-gold/40 pl-4">
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(result.analysis[key])}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )
      }
    />
  );
}
