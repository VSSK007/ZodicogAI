"use client";

/**
 * Homepage hero — copy + CTAs on the left, a "Live reading" demo panel on the
 * right (real components, sample data — the honest product screenshot).
 */
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, EASE_SPRING, charReveal } from "@/lib/motion";
import { Star4, Glyph } from "@/components/ui/glyphs";

const GRAD_CHARS = "written in the stars.".split("");

const DEMO_ROWS = [
  { label: "Zodiac polarity",      value: 91 },
  { label: "Emotional resonance",  value: 84 },
  { label: "Attachment pacing",    value: 76 },
  { label: "Love language match",  value: 88 },
  { label: "Numerology alignment", value: 79 },
];

function LiveReadingPanel() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
      className="rounded-card border border-hairline-accent bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-panel overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4.5 py-3 border-b border-hairline">
        <span className="flex items-center gap-2 font-display font-extrabold text-[10.5px] tracking-[0.2em] uppercase text-ink-muted">
          <Star4 size={10} className="text-accent" />
          Live reading
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
          <Glyph name="scorpio" size={13} className="text-gold-bright" />
          Maya
          <span className="text-ink-faint mx-0.5">×</span>
          <Glyph name="leo" size={13} className="text-gold-bright" />
          Julian
        </span>
      </div>

      {/* Score rows */}
      <div className="p-5 grid gap-3.5">
        {DEMO_ROWS.map((row, i) => (
          <div key={row.label} className="grid grid-cols-[130px_1fr_34px] items-center gap-3">
            <span className="text-xs font-medium text-ink-secondary truncate">{row.label}</span>
            <div className="h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-gold-bright))" }}
                initial={reduced ? { width: `${row.value}%` } : { width: 0 }}
                animate={{ width: `${row.value}%` }}
                transition={{ duration: 0.8, delay: 0.7 + i * 0.09, ease: EASE }}
              />
            </div>
            <span className="text-right font-mono text-xs text-gold-bright tabular-nums">{row.value}</span>
          </div>
        ))}

        {/* Verdict */}
        <div className="mt-1 pt-4 border-t border-hairline flex items-center justify-between">
          <div>
            <p className="font-display font-extrabold text-[10px] tracking-[0.22em] uppercase text-ink-muted">Overall</p>
            <p className="font-display font-extrabold text-[32px] tracking-[-0.03em] leading-tight text-ink">
              87<span className="text-[15px] text-ink-muted font-semibold">/100</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline-gold bg-gold-soft px-3 py-1.5 font-display font-extrabold text-[10.5px] tracking-[0.16em] uppercase text-gold-bright">
            <Star4 size={9} />
            Strong match
          </span>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed border-l-2 border-accent pl-3">
          <b className="text-ink font-semibold">Why:</b> Scorpio water steadies Leo fire — polarity scores
          highest across all five romantic engines, with pacing as the one watch-item.
        </p>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="max-w-6xl mx-auto px-6 pt-14 md:pt-24 pb-16 grid md:grid-cols-[1.05fr_1fr] gap-12 md:gap-16 items-center">
      <div>
        {/* Tag chip */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-hairline-accent bg-accent-soft/40 px-3.5 py-1.5 text-[12.5px] font-medium text-accent-bright mb-7"
        >
          <Star4 size={10} className="text-gold-bright" />
          18 deterministic engines · zero guesswork
        </motion.div>

        {/* Headline */}
        <h1 className="font-display font-extrabold tracking-[-0.035em] text-[42px] leading-[1.04] md:text-6xl text-ink select-none">
          Compatibility,
          <br />
          {reduced ? (
            <span className="text-gradient-accent">written in the stars.</span>
          ) : (
            <motion.span
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.025, delayChildren: 0.25 } } }}
              className="text-gradient-accent"
            >
              {GRAD_CHARS.map((char, i) => (
                <motion.span key={i} className="inline-block" variants={charReveal}>
                  {char === " " ? " " : char}
                </motion.span>
              ))}
            </motion.span>
          )}
        </h1>

        {/* Subcopy */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5, ease: EASE }}
          className="mt-6 text-ink-secondary text-[16.5px] leading-relaxed max-w-[480px]"
        >
          ZodicogAI scores every framework — zodiac, MBTI, love styles, numerology —
          with deterministic engines, then has AI explain the result. Every claim
          traces to a number.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62, ease: EASE_SPRING }}
          className="mt-9 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/analyze/hybrid"
            className="inline-flex items-center justify-center rounded-control px-7 py-3 min-h-[50px] text-[15px] font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200 tap-highlight-none active:scale-[0.98]"
          >
            Get your reading
          </Link>
          <Link
            href="/analyze/romantic"
            className="inline-flex items-center justify-center gap-1.5 rounded-control px-7 py-3 min-h-[50px] text-[15px] font-semibold text-ink-secondary border border-hairline hover:text-ink hover:border-hairline-strong transition-all duration-200 tap-highlight-none active:scale-[0.98]"
          >
            Check compatibility →
          </Link>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-4.5 text-[13px] text-ink-muted"
        >
          No sign-up · results in seconds · free
        </motion.p>
      </div>

      <LiveReadingPanel />
    </section>
  );
}
