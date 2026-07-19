"use client";

/**
 * CelebrityMatch — "Check your match" against a celebrity.
 *
 * Uses numerology compatibility (real, public birth date + name — the only
 * data this site actually has for celebrities) rather than inventing an
 * MBTI type for a real person, which would be a fabricated claim about
 * someone's actual personality.
 */
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SimpleForm, emptySimple, validateSimple, type SimplePersonState } from "@/components/ui/SimpleForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AIHeader } from "@/components/ui/AIHeader";
import ResultActions from "@/components/analyze/ResultActions";
import ShareImageButton from "@/components/ShareImageButton";
import { renderMd } from "@/lib/renderMd";
import { getSign, SIGN_META, ELEMENT_COLOR } from "@/lib/zodiac";
import { Glyph, Star4, type GlyphName } from "@/components/ui/glyphs";

interface NumerologyProfile {
  life_path_number: number;
  expression_number: number;
  lucky_number: number;
  number_title: string;
}

interface NumerologyPairResult {
  a_name: string;
  b_name: string;
  a_numerology: NumerologyProfile;
  b_numerology: NumerologyProfile;
  compatibility: {
    compatibility_score: number;
    pursue_signal: "pursue" | "caution" | "avoid";
  };
  analysis: {
    compatibility_reading: string;
    pursue_or_avoid: string;
    pair_advice: string;
  };
}

const SIGNAL_STYLES: Record<string, string> = {
  pursue:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  caution: "bg-gold/15 text-gold-bright border-hairline-gold",
  avoid:   "bg-red-500/15 text-red-300 border-red-500/30",
};

const SIGNAL_LABELS: Record<string, string> = {
  pursue: "Strong match", caution: "Mixed signals", avoid: "Tough fit",
};

export default function CelebrityMatch({
  celebName,
  celebSign,
  celebBirthDay,
  celebBirthMonth,
}: {
  celebName: string;
  celebSign: string;
  celebBirthDay: number;
  celebBirthMonth: number;
}) {
  const [open, setOpen] = useState(false);
  const [visitor, setVisitor] = useState<SimplePersonState>(emptySimple());
  const [result, setResult] = useState<NumerologyPairResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const celebSignLabel = celebSign.charAt(0).toUpperCase() + celebSign.slice(1);

  async function handleSubmit() {
    const err = validateSimple(visitor, "Your details");
    if (err) return setError(err);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<NumerologyPairResult>("/analyze/numerology", {
        person_a_name: visitor.name.trim(),
        person_a_day: Number(visitor.day),
        person_a_month: Number(visitor.month),
        person_b_name: celebName,
        person_b_day: celebBirthDay,
        person_b_month: celebBirthMonth,
      });
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const visitorSign = visitor.day && visitor.month ? getSign(Number(visitor.day), Number(visitor.month)) : null;
  const visitorMeta = visitorSign ? SIGN_META[visitorSign] : null;
  const celebMeta = SIGN_META[celebSignLabel];

  if (!open && !result) {
    return (
      <div className="mt-6 flex justify-center">
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Sparkles className="size-4" />
          Check your match with {celebName.split(" ")[0]}
        </Button>
      </div>
    );
  }

  return (
    <Card variant={result ? "featured" : "default"} className="mt-6 p-6">
      {!result ? (
        <>
          <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.18em] uppercase text-gold-bright mb-4">
            <Star4 size={9} />
            Check your match with {celebName}
          </p>
          <SimpleForm label="Your name" value={visitor} onChange={setVisitor} />
          {visitorMeta && celebMeta && (
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Glyph name={visitorMeta.glyph} size={13} style={{ color: ELEMENT_COLOR[visitorMeta.element] }} />
                You — {visitorSign}
              </span>
              <span className="text-ink-faint">×</span>
              <span className="flex items-center gap-1.5">
                <Glyph name={celebMeta.glyph as GlyphName} size={13} style={{ color: ELEMENT_COLOR[celebMeta.element] }} />
                {celebName} — {celebSignLabel}
              </span>
            </div>
          )}
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full mt-4">
            {loading ? "Reading the numbers…" : "Reveal your match"}
          </Button>
        </>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ResultActions
              analysisType="numerology_pair_analysis"
              title={`${result.a_name} × ${result.b_name} Celebrity Match`}
              payload={result}
            />
            <ShareImageButton data={{
              type: "numerology-pair",
              nameA: result.a_name, nameB: result.b_name,
              lifePathA: result.a_numerology.life_path_number,
              lifePathB: result.b_numerology.life_path_number,
              score: result.compatibility.compatibility_score,
            }} />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider">Match score</p>
              <p className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink">
                {result.compatibility.compatibility_score.toFixed(0)}
                <span className="text-lg text-ink-muted">/100</span>
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${SIGNAL_STYLES[result.compatibility.pursue_signal]}`}>
              {SIGNAL_LABELS[result.compatibility.pursue_signal]}
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <AIHeader label="Numerology Reading" />
            <div className="p-5 space-y-4">
              <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(result.analysis.compatibility_reading)}</p>
              <p className="text-sm text-ink-secondary leading-relaxed border-l-2 border-gold/40 pl-3">{renderMd(result.analysis.pair_advice)}</p>
            </div>
          </Card>

          <button
            onClick={() => { setResult(null); setOpen(false); }}
            className="text-sm font-semibold text-ink-muted hover:text-ink-secondary transition-colors"
          >
            ← Try another name
          </button>
        </div>
      )}
    </Card>
  );
}
