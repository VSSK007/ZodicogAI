"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { renderMd } from "@/lib/renderMd";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: number[];
  keywords?: string[];
}

interface EnrichedSwatch extends ColorSwatch {
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
  middle_ground: ColorSwatch;
  compatible_color: ColorSwatch;
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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
    <div className="bg-white/[0.03] md:bg-white/[0.03] p-5 rounded-2xl ring-1 ring-amber-500/20 md:ring-white/10 space-y-3">
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

function ColorSwatch({
  swatch,
  label,
  size = "normal",
}: {
  swatch: ColorSwatch;
  label: string;
  size?: "normal" | "large";
}) {
  return (
    <div className="flex flex-col gap-3">
      <motion.div
        className={`rounded-2xl ${size === "large" ? "h-40" : "h-24"} flex items-end p-4`}
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
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-white">{swatch.name}</p>
        {swatch.keywords && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {swatch.keywords.map((kw) => (
              <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-zinc-400 border border-white/10">
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
    <div className="border-l-2 border-white/20 pl-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{renderMd(text)}</p>
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

      <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
            <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Analysis</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Aura Colors</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Your spiritual aura, classic power color, and 2026 cosmic alignment
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
          {showB ? "− Remove Person B (solo reading)" : "+ Add Person B for pair compatibility"}
        </button>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition mb-8 md:mb-12 min-h-[48px]"
        >
          {loading ? "Reading the spectrum…" : "Reveal Aura Colors"}
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 md:space-y-6"
            >
              {isPair(result) ? (
                <>
                  {/* Pair: aura swatches */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-zinc-300">Aura Colors</h2>
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
                        <div key={p.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{p.label} — Power</p>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
                            <span className="text-xs text-zinc-300 font-medium">{p.name}</span>
                          </div>
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            2026: {p.yr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Harmonic palette */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-zinc-300">Harmonic Palette</h2>
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
                  </div>

                  {/* AI reading */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <div className="relative w-2 h-2">
                        <div className="absolute inset-0 rounded-full bg-amber-500 md:bg-[#4285f4] animate-ping opacity-60" />
                        <div className="relative rounded-full bg-amber-500 md:bg-[#4285f4] w-2 h-2" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Color Reading</p>
                    </div>
                    <NarrativeSection title="Color Harmony" text={result.analysis.color_harmony} />
                    <NarrativeSection title="Middle Ground Meaning" text={result.analysis.middle_ground_meaning} />
                    <NarrativeSection title="Harmonic Bridge" text={result.analysis.compatible_color_meaning} />
                    <NarrativeSection title="Advice for This Pair" text={result.analysis.pair_advice} />
                  </div>
                </>
              ) : (
                <>
                  {/* Single: aura color — primary large swatch */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Spiritual Aura</p>
                    <ColorSwatch swatch={result.color} label={result.sign} size="large" />
                  </div>

                  {/* Power color + 2026 row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Classic power color */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Classic Power Color</p>
                      <div
                        className="h-16 rounded-xl"
                        style={{ backgroundColor: result.color.power_hex }}
                      />
                      <p className="text-sm font-semibold text-white">{result.color.power_name}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">{result.color.power_hex}</p>
                    </div>

                    {/* 2026 power color */}
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium uppercase tracking-wider">2026 Cosmic</span>
                        </div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">This Year&apos;s Power Color</p>
                        <p className="text-2xl font-bold text-amber-300 tracking-tight leading-tight">
                          {result.color.power_2026}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        The cosmic color aligned with {result.sign} energy for 2026 — wear it, surround yourself with it.
                      </p>
                    </div>
                  </div>

                  {/* AI reading */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <div className="relative w-2 h-2">
                        <div className="absolute inset-0 rounded-full bg-amber-500 md:bg-[#4285f4] animate-ping opacity-60" />
                        <div className="relative rounded-full bg-amber-500 md:bg-[#4285f4] w-2 h-2" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Color Reading</p>
                    </div>
                    <NarrativeSection title="Color Meaning" text={result.analysis.color_meaning} />
                    <NarrativeSection title="Love Energy" text={result.analysis.love_energy} />
                    <NarrativeSection title="How to Harness It" text={result.analysis.color_advice} />
                    {result.analysis.power_colors.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Complementary Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.power_colors.map((c) => (
                            <span key={c} className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
