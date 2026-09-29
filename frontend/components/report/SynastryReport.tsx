"use client";

/**
 * SynastryReport — the flagship long-form report for a pair.
 *
 * One editorial page instead of slides: hero verdict, six numbered sections,
 * a sticky section index with scroll-spy, a reading-progress bar, per-section
 * share links (which point at the saved /r/[id] permalink), and print styles
 * so "Export PDF" is just the browser's print-to-PDF.
 *
 * Used live on /dashboard and on shared /r/[id] pages for saved reports.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Link as LinkIcon, Printer } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import { TraitRadar } from "@/components/LazyCharts";
import { BehavioralMap } from "@/components/LazyCharts";
import Sigil from "@/components/Sigil";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SignGlyph, Star4 } from "@/components/ui/glyphs";
import { renderMd } from "@/lib/renderMd";
import { DUR, EASE } from "@/lib/motion";
import type { FullResult, ReportPersonas } from "@/components/report/types";

// ── Static config ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "verdict",    label: "Verdict",           lede: "Where the two of you land overall — and how confident the engines are." },
  { id: "dimensions", label: "Dimensions",        lede: "Eight independent engines, each scoring a different layer of compatibility." },
  { id: "love",       label: "Love intelligence", lede: "How each of you gives and receives love, and how well those styles meet." },
  { id: "vectors",    label: "Trait vectors",     lede: "Five behavioral axes, side by side — where you mirror and where you diverge." },
  { id: "risk",       label: "Strengths & risks", lede: "What the pairing has going for it, and what to watch." },
  { id: "reading",    label: "The reading",       lede: "An AI interpretation written from the scores above — never the other way round." },
] as const;

/** Per-dimension data colours (categorical, used only for bars). */
const DIM_COLORS: Record<string, string> = {
  Emotional: "#a78bfa", Romantic: "#fb7185", Behavioral: "#60a5fa", Intimacy: "#818cf8",
  "Love Style": "#fb923c", "Love Language": "#2dd4bf", Numerology: "#fbbf24", Zodiac: "#f472b6",
};

const STABILITY: Record<string, { color: string; label: string }> = {
  stable:   { color: "var(--color-success)", label: "Stable" },
  moderate: { color: "var(--color-warning)", label: "Moderate" },
  volatile: { color: "var(--color-danger)",  label: "Volatile" },
};

const SIGNAL: Record<string, { cls: string; label: string }> = {
  pursue:  { cls: "bg-success/10 text-success border-success/25", label: "Numerology match" },
  caution: { cls: "bg-warning/10 text-warning border-warning/25", label: "Numerology caution" },
  avoid:   { cls: "bg-danger/10 text-danger border-danger/25",   label: "Numerology clash" },
};

function dimensions(r: FullResult) {
  return [
    { name: "Emotional",     score: r.emotional.emotional_compatibility_score },
    { name: "Romantic",      score: r.romantic.romantic_compatibility_score },
    { name: "Behavioral",    score: r.vector_similarity_percent },
    { name: "Intimacy",      score: r.sextrology.sexual_compatibility_score },
    { name: "Love Style",    score: r.love_style.love_style_compatibility_score },
    { name: "Love Language", score: r.love_language.love_language_compatibility_score },
    { name: "Numerology",    score: r.numerology_compat.compatibility_score },
    { name: "Zodiac",        score: r.zodiac_compatibility_score },
  ];
}

function verdictFor(score: number) {
  if (score >= 80) return "A rare alignment";
  if (score >= 65) return "Strong foundations";
  if (score >= 45) return "Workable, with effort";
  return "Real friction to navigate";
}

// ── Small pieces ──────────────────────────────────────────────────────────────

function ScoreChip({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-success/15 text-success border-success/30" :
    score >= 65 ? "bg-accent/15 text-accent-bright border-accent/30" :
    score >= 45 ? "bg-warning/15 text-warning border-warning/30" :
                  "bg-danger/15 text-danger border-danger/30";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums border ${cls}`}>
      {score.toFixed(0)}
    </span>
  );
}

function ShareSectionButton({ sectionId, shareId }: { sectionId: string; shareId: string | null }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!shareId) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${shareId}#${sectionId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      onClick={copy}
      disabled={!shareId}
      data-print-hide
      aria-label="Copy link to this section"
      title={shareId ? "Copy link to this section" : "Saving your link…"}
      className="ml-auto shrink-0 size-8 rounded-full border border-hairline flex items-center justify-center text-ink-muted hover:text-ink hover:border-hairline-strong disabled:opacity-30 transition-colors tap-highlight-none"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <LinkIcon className="size-3.5" />}
    </button>
  );
}

function Section({
  index, id, label, lede, shareId, children,
}: {
  index: number; id: string; label: string; lede: string; shareId: string | null; children: ReactNode;
}) {
  return (
    <section id={id} data-report-section className="scroll-mt-24 py-10 md:py-12 border-t border-hairline first:border-t-0 first:pt-0">
      <RevealOnScroll y={18}>
        <div className="flex items-start gap-4 mb-6">
          <span className="font-mono text-micro tracking-[0.2em] text-gold pt-2 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-[-0.03em] text-ink">{label}</h2>
            <p className="mt-1.5 text-ink-secondary max-w-prose leading-relaxed">{lede}</p>
          </div>
          <ShareSectionButton sectionId={id} shareId={shareId} />
        </div>
      </RevealOnScroll>
      {children}
    </section>
  );
}

function Bar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div
      className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden"
      style={{ "--w": `${pct}%` } as React.CSSProperties}
    >
      <motion.div
        data-bar-fill
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: DUR.slow, delay, ease: EASE }}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SynastryReport({
  result,
  personas,
  title,
  shareId,
  actions,
}: {
  result: FullResult;
  personas: ReportPersonas;
  title: string;
  shareId: string | null;
  /** Live-mode controls (copy link, share image…), shown in the hero. */
  actions?: ReactNode;
}) {
  const ri = result.relationship_intelligence;
  const nc = result.numerology_compat;
  const dims = useMemo(() => dimensions(result), [result]);
  const top = dims.reduce((m, d) => (d.score > m.score ? d : m));
  const low = dims.reduce((m, d) => (d.score < m.score ? d : m));
  const stab = STABILITY[ri.stability_prediction] ?? STABILITY.moderate;
  const signal = SIGNAL[nc.pursue_signal];

  // ── scroll progress + scroll-spy ─────────────────────────────────────────
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-report-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  // Honour /r/<id>#section when a shared link is opened.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTIONS.some((s) => s.id === hash)) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }), 350);
    }
  }, []);

  const keys = ["relationship_dynamic", "communication_pattern", "conflict_risk", "long_term_viability"] as const;
  const aiMissing = keys.every((k) => !result.analysis[k] || result.analysis[k] === "—");

  return (
    <div ref={rootRef} data-report className="relative">
      {/* Reading progress */}
      <motion.div
        aria-hidden="true"
        data-print-hide
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-0.5 z-[60] origin-left bg-gradient-to-r from-accent-bright to-gold-bright"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="relative mb-10 md:mb-14">
        <div className="absolute -top-6 right-0 opacity-90 hidden sm:block" aria-hidden="true">
          <Sigil seed={title} size={132} />
        </div>
        <Eyebrow>Full synastry report</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.035em] leading-[1.05] text-4xl md:text-6xl text-ink text-balance sm:pr-36">
          {personas.a.name}
          <span className="text-gold-bright mx-3 md:mx-4 align-middle text-2xl md:text-4xl" aria-hidden="true">×</span>
          {personas.b.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[personas.a, personas.b].map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/[0.03] px-3 py-1 text-xs text-ink-secondary">
              {p.sign && <SignGlyph sign={p.sign} size={13} className="text-gold-bright" />}
              {p.sign || p.name}
              {p.mbti && <span className="font-mono text-ink-muted">· {p.mbti}</span>}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10">
          <div className="shrink-0 self-start sm:self-center">
            <ScoreRing score={ri.overall_score} size={176} strokeWidth={11} color="var(--color-accent-bright)" label="Overall" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-extrabold tracking-[-0.03em] text-2xl md:text-4xl text-ink text-balance">
              {verdictFor(ri.overall_score)}.
            </p>
            <p className="mt-3 text-ink-secondary max-w-prose leading-relaxed">
              Strongest on <strong className="text-ink font-semibold">{top.name.toLowerCase()}</strong>{" "}
              (<span className="tabular-nums">{top.score.toFixed(0)}</span>), weakest on{" "}
              <strong className="text-ink font-semibold">{low.name.toLowerCase()}</strong>{" "}
              (<span className="tabular-nums">{low.score.toFixed(0)}</span>). Predicted stability:{" "}
              <strong className="font-semibold" style={{ color: stab.color }}>{stab.label.toLowerCase()}</strong>.
            </p>
          </div>
        </div>

        {actions && <div className="mt-8 flex flex-wrap items-center gap-2" data-print-hide>{actions}</div>}
      </header>

      <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12 print:!block">
        {/* ── Index ──────────────────────────────────────────────────────── */}
        <aside className="hidden lg:block" data-print-hide>
          <nav aria-label="Report sections" className="sticky top-24">
            <p className="flex items-center gap-1.5 font-display font-extrabold text-micro uppercase tracking-[0.2em] text-ink-muted mb-3">
              <Star4 size={9} className="text-gold" /> In this report
            </p>
            <ol className="space-y-0.5 border-l border-hairline">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => jump(s.id)}
                    aria-current={active === s.id ? "true" : undefined}
                    className={`-ml-px w-full text-left border-l-2 pl-4 py-1.5 text-sm transition-colors tap-highlight-none ${
                      active === s.id
                        ? "border-gold text-ink font-semibold"
                        : "border-transparent text-ink-muted hover:text-ink-secondary"
                    }`}
                  >
                    <span className="font-mono text-micro text-ink-faint mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
            <button
              onClick={() => window.print()}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors tap-highlight-none"
            >
              <Printer className="size-3.5" aria-hidden="true" /> Export as PDF
            </button>
          </nav>
        </aside>

        {/* Mobile section chips */}
        <div className="lg:hidden sticky top-0 z-30 -mx-4 px-4 py-2 mb-2 bg-surface/85 backdrop-blur-xl border-b border-hairline" data-print-hide>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => jump(s.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors tap-highlight-none ${
                  active === s.id ? "bg-accent text-accent-ink" : "text-ink-muted border border-hairline"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sections ───────────────────────────────────────────────────── */}
        <div className="min-w-0 lg:col-start-2">
          {/* 01 Verdict */}
          <Section index={0} {...SECTIONS[0]} shareId={shareId}>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card className="p-5">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Stability</p>
                <p className="font-display font-extrabold text-2xl" style={{ color: stab.color }}>{stab.label}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Conflict risk</p>
                <p className="font-display font-extrabold text-2xl text-ink tabular-nums">
                  {ri.conflict_probability.toFixed(0)}<span className="text-base text-ink-muted ml-0.5">%</span>
                </p>
                <div className="mt-3"><Bar score={ri.conflict_probability} color="var(--color-danger)" /></div>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Element</p>
                <p className="font-display font-extrabold text-2xl text-ink">{result.element_compatibility}</p>
                <p className="mt-1 text-xs text-ink-muted">{result.modality_interaction}</p>
              </Card>
            </div>
            <span className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold border ${signal.cls}`}>
              {signal.label}
            </span>
          </Section>

          {/* 02 Dimensions */}
          <Section index={1} {...SECTIONS[1]} shareId={shareId}>
            <Card className="p-5 md:p-6">
              <ul>
                {dims.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-4 py-3.5 border-b border-hairline last:border-0">
                    <span className="w-28 md:w-32 shrink-0 text-sm text-ink-secondary">{d.name}</span>
                    <Bar score={d.score} color={DIM_COLORS[d.name]} delay={i * 0.06} />
                    {d === top && <span className="hidden sm:inline text-micro font-semibold uppercase tracking-wider text-success">Strongest</span>}
                    {d === low && <span className="hidden sm:inline text-micro font-semibold uppercase tracking-wider text-danger">Weakest</span>}
                    <ScoreChip score={d.score} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card variant="gold" className="mt-4 p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h3 className="text-sm font-semibold text-ink-secondary">Numerology breakdown</h3>
                <span className="text-xs font-semibold tabular-nums text-gold-bright">{nc.compatibility_score.toFixed(0)}% overall</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Life path", value: nc.life_path_score },
                  { label: "Expression", value: nc.expression_score },
                  { label: "Cross-pair", value: nc.cross_score },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-card bg-white/[0.03] border border-hairline p-3">
                    <p className="text-micro text-ink-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-display font-extrabold text-2xl text-ink tabular-nums">
                      {value.toFixed(0)}<span className="text-xs text-ink-muted ml-0.5">%</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* 03 Love intelligence */}
          <Section index={2} {...SECTIONS[2]} shareId={shareId}>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Love style match", score: result.love_style.love_style_compatibility_score, color: DIM_COLORS["Love Style"],
                  a: result.love_style.a_love_style.dominant_style, b: result.love_style.b_love_style.dominant_style },
                { label: "Love language match", score: result.love_language.love_language_compatibility_score, color: DIM_COLORS["Love Language"],
                  a: result.love_language.a_love_language.primary_language.replace(/_/g, " "),
                  b: result.love_language.b_love_language.primary_language.replace(/_/g, " ") },
              ].map((c) => (
                <Card key={c.label} className="p-5">
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">{c.label}</p>
                  <p className="font-display font-extrabold text-4xl tabular-nums" style={{ color: c.color }}>
                    {c.score.toFixed(0)}<span className="text-base text-ink-muted ml-0.5">%</span>
                  </p>
                  <div className="mt-3 mb-4"><Bar score={c.score} color={c.color} /></div>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-ink-muted">{personas.a.name}</dt><dd className="font-semibold capitalize text-ink">{c.a}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-ink-muted">{personas.b.name}</dt><dd className="font-semibold capitalize text-ink">{c.b}</dd></div>
                  </dl>
                </Card>
              ))}
            </div>
          </Section>

          {/* 04 Trait vectors */}
          <Section index={3} {...SECTIONS[3]} shareId={shareId}>
            <Card className="p-4 md:p-6">
              <TraitRadar a={result.a_traits} b={result.b_traits} nameA={personas.a.name} nameB={personas.b.name} />
            </Card>
            <div className="mt-4">
              <BehavioralMap aTraits={result.a_traits} bTraits={result.b_traits} nameA={personas.a.name} nameB={personas.b.name} />
            </div>
          </Section>

          {/* 05 Strengths & risks */}
          <Section index={4} {...SECTIONS[4]} shareId={shareId}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Strengths", items: ri.strengths, tone: "text-success", bar: "from-success/50" },
                { title: "Risk areas", items: ri.risks, tone: "text-danger", bar: "from-danger/50" },
              ].map((col) => (
                <Card key={col.title} className="overflow-hidden">
                  <div className={`h-0.5 bg-gradient-to-r ${col.bar} to-transparent`} />
                  <div className="p-5">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${col.tone}`}>{col.title}</p>
                    <ol className="space-y-3">
                      {col.items.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className={`font-mono tabular-nums font-bold shrink-0 mt-0.5 ${col.tone}`}>{i + 1}.</span>
                          <span className="text-ink-secondary leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* 06 The reading */}
          <Section index={5} {...SECTIONS[5]} shareId={shareId}>
            {aiMissing ? (
              <Card className="p-8 text-center">
                <p className="text-ink-muted text-sm">The AI interpretation is unavailable for this report — the model timed out or was rate-limited.</p>
                <p className="text-ink-muted text-xs mt-1">Generate the report again to retry.</p>
              </Card>
            ) : (
              <div className="space-y-8">
                {keys.map((key, i) => (
                  <RevealOnScroll key={key} y={14} delay={i * 0.05}>
                    <div className="border-l-2 border-gold/40 pl-5">
                      <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className={`text-ink-secondary leading-[1.8] max-w-prose ${i === 0 ? "text-base md:text-lg text-ink" : "text-sm md:text-base"}`}>
                        {renderMd(result.analysis[key])}
                      </p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
