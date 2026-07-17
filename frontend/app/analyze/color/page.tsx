"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface ColorSwatchData {
  name: string;
  hex: string;
  rgb: number[];
  keywords?: string[];
}

interface EnrichedSwatch extends ColorSwatchData {
  power_name: string;
  power_hex: string;
  power_2026: string;
}

interface SingleResult {
  name: string;
  sign: string;
  color: EnrichedSwatch;
  analysis: {
    color_meaning: string;
    love_energy: string;
    color_advice: string;
    power_colors: string[];
  };
}

interface PairResult {
  a_name: string;
  b_name: string;
  a_color: EnrichedSwatch;
  b_color: EnrichedSwatch;
  middle_ground: ColorSwatchData;
  compatible_color: ColorSwatchData;
  analysis: {
    color_harmony: string;
    compatible_color_meaning: string;
    middle_ground_meaning: string;
    pair_advice: string;
  };
}

type ColorResult = SingleResult | PairResult;

function isPair(r: ColorResult): r is PairResult {
  return "a_name" in r;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorSwatch({
  swatch,
  label,
  size = "normal",
}: {
  swatch: ColorSwatchData;
  label: string;
  size?: "normal" | "large";
}) {
  return (
    <div className="flex flex-col gap-3">
      <motion.div
        className={`rounded-card ${size === "large" ? "h-40" : "h-24"} flex items-end p-4`}
        style={{ backgroundColor: swatch.hex }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-xs font-mono font-semibold text-black/60 bg-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {swatch.hex}
        </span>
      </motion.div>
      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-ink">{swatch.name}</p>
        {swatch.keywords && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {swatch.keywords.map((kw) => (
              <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-ink-secondary border border-hairline">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ColorPage() {
  const [a, setA] = useState<SimplePersonState>(emptySimple());
  const [b, setB] = useState<SimplePersonState>(emptySimple());
  const [showB, setShowB] = useState(false);
  const [result, setResult] = useState<ColorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The hex used for background illumination
  const glowHex = result
    ? isPair(result)
      ? result.middle_ground.hex
      : result.color.hex
    : null;

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
      setResult(await apiFetch<ColorResult>("/analyze/color", body));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Background illumination — aura color glow ──────────────────────── */}
      <AnimatePresence>
        {glowHex && (
          <motion.div
            key={glowHex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: -15,
              background: [
                `radial-gradient(ellipse 90% 55% at 50% 10%, ${hexToRgba(glowHex, 0.22)} 0%, transparent 65%)`,
                `radial-gradient(ellipse 60% 40% at 80% 70%, ${hexToRgba(glowHex, 0.08)} 0%, transparent 60%)`,
              ].join(", "),
            }}
          />
        )}
      </AnimatePresence>

      <AnalyzePageShell
        eyebrow="Analysis"
        title="Aura Colors"
        description="Your spiritual aura, classic power color, and 2026 cosmic alignment."
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
              {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for pair compatibility"}
            </button>

            <Button
              onClick={handleSubmit}
              loading={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Reading the spectrum…" : "Reveal Aura Colors"}
            </Button>
          </>
        }
        result={
          result && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <ResultActions
                  analysisType={isPair(result) ? "color_pair_analysis" : "color_analysis"}
                  title={isPair(result) ? `${result.a_name} × ${result.b_name} Aura Harmony` : `${result.name}'s Aura Colors`}
                  payload={result}
                />
                {isPair(result)
                  ? <ShareImageButton data={{ type: "color-pair", nameA: result.a_name, nameB: result.b_name, hexA: result.a_color.hex, hexB: result.b_color.hex, auraNameA: result.a_color.name, auraNameB: result.b_color.name }} />
                  : <ShareImageButton data={{ type: "color-single", name: result.name, sign: result.sign, auraHex: result.color.hex, auraName: result.color.name, powerName: result.color.power_name }} />
                }
              </div>

              {isPair(result) ? (
                <>
                  {/* Pair: aura swatches */}
                  <Card className="p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-ink-secondary">Aura Colors</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorSwatch swatch={result.a_color} label={result.a_name} size="large" />
                      <ColorSwatch swatch={result.b_color} label={result.b_name} size="large" />
                    </div>
                    {/* Power color pills */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { label: result.a_name, name: result.a_color.power_name, hex: result.a_color.power_hex, yr: result.a_color.power_2026 },
                        { label: result.b_name, name: result.b_color.power_name, hex: result.b_color.power_hex, yr: result.b_color.power_2026 },
                      ].map((p) => (
                        <div key={p.label} className="rounded-control border border-hairline bg-white/[0.03] p-3 space-y-2">
                          <p className="text-[10px] text-ink-muted uppercase tracking-wider">{p.label} — Power</p>
                          <div className="flex items-center gap-2">
                            <div className="size-5 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
                            <span className="text-xs text-ink-secondary font-medium">{p.name}</span>
                          </div>
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold-bright border border-hairline-gold">
                            2026: {p.yr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Harmonic palette */}
                  <Card className="p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-ink-secondary">Harmonic Palette</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorSwatch swatch={result.middle_ground} label="Middle Ground" />
                      <ColorSwatch swatch={result.compatible_color} label="Harmonic Bridge" />
                    </div>
                    <div
                      className="h-4 rounded-full overflow-hidden"
                      style={{
                        background: `linear-gradient(to right, ${result.a_color.hex}, ${result.middle_ground.hex}, ${result.b_color.hex})`,
                      }}
                    />
                  </Card>

                  {/* AI reading */}
                  <Card className="p-6 space-y-5">
                    <AIHeader label="AI Color Reading" />
                    <NarrativeSection title="Color Harmony" text={result.analysis.color_harmony} />
                    <NarrativeSection title="Middle Ground Meaning" text={result.analysis.middle_ground_meaning} />
                    <NarrativeSection title="Harmonic Bridge" text={result.analysis.compatible_color_meaning} />
                    <NarrativeSection title="Advice for This Pair" text={result.analysis.pair_advice} />
                  </Card>
                </>
              ) : (
                <>
                  {/* Single: aura color — primary large swatch */}
                  <Card className="p-6">
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-4">Spiritual Aura</p>
                    <ColorSwatch swatch={result.color} label={result.sign} size="large" />
                  </Card>

                  {/* Power color + 2026 row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Classic power color */}
                    <Card className="p-5 space-y-3">
                      <p className="text-xs text-ink-muted uppercase tracking-wider">Classic Power Color</p>
                      <div
                        className="h-16 rounded-control"
                        style={{ backgroundColor: result.color.power_hex }}
                      />
                      <p className="text-sm font-semibold text-ink">{result.color.power_name}</p>
                      <p className="text-xs text-ink-muted leading-relaxed font-mono">{result.color.power_hex}</p>
                    </Card>

                    {/* 2026 power color */}
                    <Card variant="gold" className="p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold-bright border border-hairline-gold font-medium uppercase tracking-wider">2026 Cosmic</span>
                        </div>
                        <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">This Year&apos;s Power Color</p>
                        <p className="text-2xl font-bold text-gold-bright tracking-tight leading-tight">
                          {result.color.power_2026}
                        </p>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        The cosmic color aligned with {result.sign} energy for 2026 — wear it, surround yourself with it.
                      </p>
                    </Card>
                  </div>

                  {/* AI reading */}
                  <Card className="p-6 space-y-5">
                    <AIHeader label="AI Color Reading" />
                    <NarrativeSection title="Color Meaning" text={result.analysis.color_meaning} />
                    <NarrativeSection title="Love Energy" text={result.analysis.love_energy} />
                    <NarrativeSection title="How to Harness It" text={result.analysis.color_advice} />
                    {result.analysis.power_colors.length > 0 && (
                      <div>
                        <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Complementary Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.power_colors.map((c) => (
                            <span key={c} className="text-xs px-3 py-1 rounded-full bg-white/10 text-ink-secondary border border-hairline">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          )
        }
      />
    </>
  );
}
