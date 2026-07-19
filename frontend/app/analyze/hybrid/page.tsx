"use client";

import { useState } from "react";
import TraitRadar from "@/components/TraitRadar";
import PersonForm from "@/components/PersonForm";
import { renderMd } from "@/lib/renderMd";
import { PersonData, emptyPerson, validatePerson, apiFetch } from "@/lib/api";
import ShareImageButton from "@/components/ShareImageButton";
import { SIGN_SYMBOL, SIGN_COLOR } from "@/lib/celebrities";
import AnalyzePageShell from "@/components/analyze/AnalyzePageShell";
import ResultActions from "@/components/analyze/ResultActions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AIHeader } from "@/components/ui/AIHeader";

const MODALITY_COLOR: Record<string, string> = {
  Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
};

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
      setResult(await apiFetch<HybridResult>("/analyze/hybrid", {
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
  const hasResult = !!(result && zodiac && mbtiProf && analysis);

  return (
    <AnalyzePageShell
      eyebrow="Self Analysis"
      title="Behavioral Intelligence Profile"
      description="Zodiac + MBTI deep analysis."
      hasResult={hasResult}
      loading={loading}
      skeletonVariant="solo"
      error={error}
      onRetry={handleSubmit}
      onReset={() => setResult(null)}
      form={
        <>
          <div className="mb-6">
            <PersonForm label="Your Profile" value={person} onChange={setPerson} />
          </div>
          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
            {loading ? "Analyzing…" : "Analyze Your Profile"}
          </Button>
        </>
      }
      result={
        hasResult && result && zodiac && mbtiProf && analysis && (
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <ResultActions
                analysisType="hybrid_analysis"
                title={`${result.name || name}'s Behavioral Profile`}
                payload={result}
              />
              <ShareImageButton data={{
                type: "hybrid",
                name: result.name || name,
                sign: zodiac.sign,
                symbol: SIGN_SYMBOL[zodiac.sign.toLowerCase()] ?? "✦",
                signColor: SIGN_COLOR[zodiac.sign.toLowerCase()] ?? "#f59e0b",
                mbtiType: mbtiProf.type,
                modality: zodiac.modality,
              }} />
            </div>

            {/* Zodiac + MBTI Overview */}
            <Card className="p-5 md:p-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Zodiac</p>
                  <p className="text-2xl font-bold text-gold-bright">{zodiac.sign}</p>
                  <p className="text-xs text-ink-secondary mt-1">
                    {zodiac.element} · <span style={{ color: MODALITY_COLOR[zodiac.modality] ?? "#a1a1aa" }}>{zodiac.modality}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">MBTI Type</p>
                  <p className="text-2xl font-bold text-accent-bright">{mbtiProf.type}</p>
                  <p className="text-xs text-ink-secondary mt-1">{mbtiProf.role_group}</p>
                </div>
              </div>
              {mbtiProf.cognitive_stack && (
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Cognitive Stack</p>
                  <p className="text-sm text-ink-secondary">{mbtiProf.cognitive_stack}</p>
                </div>
              )}
            </Card>

            {/* Trait Radar */}
            <Card className="p-4 md:p-6">
              <h2 className="text-sm font-semibold text-ink-secondary mb-4">Behavioral Trait Profile</h2>
              <TraitRadar
                a={zodiac.trait_vector}
                b={undefined}
                nameA={name}
                nameB={undefined}
              />
            </Card>

            {/* AI Interpretation */}
            <Card>
              <AIHeader label="Behavioral Analysis" />
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
                  <div key={key} className="border-l-2 border-gold/40 pl-4">
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(analysis[key] as string)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths + Growth Edges */}
            {(analysis.strengths?.length > 0 || analysis.growth_edges?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-card border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-3">Strengths</p>
                  <ul className="space-y-1.5">
                    {(analysis.strengths ?? []).map((s, i) => (
                      <li key={i} className="text-sm text-ink-secondary flex gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{renderMd(s)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-card border border-hairline-gold bg-gold/5 p-5">
                  <p className="text-xs text-gold-bright uppercase tracking-wider mb-3">Growth Edges</p>
                  <ul className="space-y-1.5">
                    {(analysis.growth_edges ?? []).map((s, i) => (
                      <li key={i} className="text-sm text-ink-secondary flex gap-2">
                        <span className="text-gold mt-0.5 shrink-0">→</span>{renderMd(s)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )
      }
    />
  );
}
