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
    <AnalyzePageShell
      eyebrow="Analysis"
      title="Love Language"
      description="Words, Acts, Gifts, Time, Touch alignment."
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
            {loading ? "Analyzing…" : "Analyze Love Languages"}
          </Button>
        </>
      }
      result={
        result && (
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <ResultActions
                analysisType="love_language_analysis"
                title={`${names.a} × ${names.b} Love Language Match`}
                payload={result}
              />
              <ShareImageButton data={{
                type: "compat",
                nameA: names.a, nameB: names.b,
                signA: getSign(a.day, a.month), symbolA: SIGN_SYMBOL[getSign(a.day, a.month)] ?? "✦", colorA: SIGN_COLOR[getSign(a.day, a.month)] ?? "#f59e0b",
                signB: getSign(b.day, b.month), symbolB: SIGN_SYMBOL[getSign(b.day, b.month)] ?? "✦", colorB: SIGN_COLOR[getSign(b.day, b.month)] ?? "#818cf8",
                score: result.love_language_compatibility_score,
              }} />
            </div>

            {/* Score + primary languages */}
            <Card className="p-5 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
                <ScoreRing score={result.love_language_compatibility_score} size={160} label="Language Alignment" color="var(--color-accent-bright)" />
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <MetricCard label={`${names.a} Primary`} value={result.a_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
                  <MetricCard label={`${names.b} Primary`} value={result.b_love_language.primary_language.replace(/_/g, " ")} unit="" accent="teal" />
                </div>
              </div>
            </Card>

            {/* Distribution */}
            <Card className="p-4 md:p-6">
              <h2 className="text-sm font-semibold text-ink-secondary mb-1">Love Language Distribution</h2>
              <div className="flex gap-4 mb-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent-bright inline-block" />{names.a}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-gold-bright inline-block" />{names.b}
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
