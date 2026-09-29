"use client";

/**
 * /dashboard — the full synastry report. Two people in, one long-form report
 * out (see components/report/SynastryReport). Saved on completion so every
 * section has a shareable permalink.
 */
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import PersonForm from "@/components/PersonForm";
import ShareImageButton from "@/components/ShareImageButton";
import AnalyzeSkeleton from "@/components/AnalyzeSkeleton";
import SynastryReport from "@/components/report/SynastryReport";
import ResultActions from "@/components/analyze/ResultActions";
import { Button } from "@/components/ui/Button";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PersonData, emptyPerson, validatePerson, pairBody, apiFetch } from "@/lib/api";
import { usePrefilledPerson } from "@/lib/profile";
import { getSign, getSignKey } from "@/lib/zodiac";
import { SIGN_COLOR, SIGN_SYMBOL } from "@/lib/celebrities";
import type { FullResult, ReportPersonas } from "@/components/report/types";

function persona(p: PersonData) {
  return {
    name: p.name.trim() || "Person",
    sign: getSign(Number(p.day), Number(p.month)),
    mbti: p.mbti || undefined,
  };
}

export default function DashboardPage() {
  const [a, setA] = usePrefilledPerson();
  const [b, setB] = useState<PersonData>(emptyPerson());
  const [result, setResult] = useState<FullResult | null>(null);
  const [personas, setPersonas] = useState<ReportPersonas | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The floating mobile buttons would sit on top of the report's chips.
  useEffect(() => {
    document.body.classList.toggle("results-open", !!result);
    return () => document.body.classList.remove("results-open");
  }, [result]);

  async function handleSubmit() {
    const errA = validatePerson(a, "Person A");
    const errB = validatePerson(b, "Person B");
    if (errA) return setError(errA);
    if (errB) return setError(errB);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<FullResult>("/analyze/full", pairBody(a, b));
      setPersonas({ a: persona(a), b: persona(b) });
      setShareId(null);
      setResult(data);
      window.scrollTo({ top: 0 });
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const title = personas ? `${personas.a.name} × ${personas.b.name} Synastry Report` : "";

  // Saved with the result so a shared link can show who the report is about.
  const savedPayload = useMemo(
    () => (result && personas ? { ...result, personas } : null),
    [result, personas],
  );

  if (result && personas) {
    return (
      <main className="min-h-screen px-4 md:px-6 py-6 md:py-10 max-w-6xl mx-auto">
        <button
          onClick={() => setResult(null)}
          data-print-hide
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors"
        >
          ← New report
        </button>
        <SynastryReport
          result={result}
          personas={personas}
          title={title}
          shareId={shareId}
          actions={
            <>
              <ResultActions
                analysisType="full_relationship_intelligence"
                title={title}
                payload={savedPayload}
                onSaved={setShareId}
                showSigil={false}
              />
              <ShareImageButton
                data={{
                  type: "compat",
                  nameA: personas.a.name, nameB: personas.b.name,
                  signA: personas.a.sign, symbolA: SIGN_SYMBOL[getSignKey(Number(a.day), Number(a.month))] ?? "✦",
                  colorA: SIGN_COLOR[getSignKey(Number(a.day), Number(a.month))] ?? "#f59e0b",
                  signB: personas.b.sign, symbolB: SIGN_SYMBOL[getSignKey(Number(b.day), Number(b.month))] ?? "✦",
                  colorB: SIGN_COLOR[getSignKey(Number(b.day), Number(b.month))] ?? "#818cf8",
                  score: result.relationship_intelligence.overall_score,
                }}
              />
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
              >
                <Printer className="size-3.5" aria-hidden="true" /> Export PDF
              </button>
            </>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-4xl mx-auto">
      <header className="mb-8 md:mb-10">
        <Eyebrow>Relationship intelligence</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-[40px] leading-[1.08] text-ink text-balance">
          Full synastry report
        </h1>
        <p className="mt-3 text-ink-secondary max-w-xl leading-relaxed">
          Eight compatibility dimensions, trait vectors, risk areas and an AI reading — one long-form report
          you can share section by section or save as a PDF.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PersonForm label="Person A" value={a} onChange={setA} self />
        <PersonForm label="Person B" value={b} onChange={setB} />
      </div>

      {error && <ErrorNotice message={error} onRetry={handleSubmit} className="mb-4" />}

      <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
        {loading ? "Reading the stars…" : "Generate synastry report"}
      </Button>

      {loading && (
        <div className="mt-8">
          <AnalyzeSkeleton variant="pair" />
        </div>
      )}
    </main>
  );
}
