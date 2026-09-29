/**
 * Homepage hero — copy + CTAs on the left, a "Live reading" demo panel on the
 * right (real components, sample data — the honest product screenshot).
 *
 * Entrance motion is pure CSS (.hero-in / .bar-grow in globals.css), so the
 * copy is visible in the server-rendered HTML and animates from first paint —
 * the LCP text never waits for JavaScript to hydrate.
 */
import type { CSSProperties } from "react";
import Link from "next/link";
import { Star4, Glyph } from "@/components/ui/glyphs";

// Split into words (not raw characters) so the line only wraps between
// words — a lone trailing "." or a mid-word break can't end up isolated.
const GRAD_WORDS = "written in the stars.".split(" ");

const DEMO_ROWS = [
  { label: "Zodiac polarity",      value: 91 },
  { label: "Emotional resonance",  value: 84 },
  { label: "Attachment pacing",    value: 76 },
  { label: "Love language match",  value: 88 },
  { label: "Numerology alignment", value: 79 },
];

function LiveReadingPanel() {
  return (
    <div
      style={{ "--hero-delay": "0.35s" } as CSSProperties}
      className="hero-in rounded-card border border-hairline-accent bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-panel overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4.5 py-3 border-b border-hairline">
        <span className="flex items-center gap-2 font-display font-extrabold text-micro tracking-[0.2em] uppercase text-ink-muted">
          <Star4 size={10} className="text-accent" />
          Live reading
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
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
              <div
                className="bar-grow h-full rounded-full"
                style={{
                  width: `${row.value}%`,
                  background: "linear-gradient(90deg, var(--color-accent), var(--color-gold-bright))",
                  "--hero-delay": `${(0.7 + i * 0.09).toFixed(2)}s`,
                } as CSSProperties}
              />
            </div>
            <span className="text-right font-mono text-xs text-gold-bright tabular-nums">{row.value}</span>
          </div>
        ))}

        {/* Verdict */}
        <div className="mt-1 pt-4 border-t border-hairline flex items-center justify-between">
          <div>
            <p className="font-display font-extrabold text-micro tracking-[0.22em] uppercase text-ink-muted">Overall</p>
            <p className="font-display font-extrabold text-[32px] tracking-[-0.03em] leading-tight text-ink">
              87<span className="text-base text-ink-muted font-semibold">/100</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline-gold bg-gold-soft px-3 py-1.5 font-display font-extrabold text-micro tracking-[0.16em] uppercase text-gold-bright">
            <Star4 size={9} />
            Strong match
          </span>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed border-l-2 border-accent pl-3">
          <b className="text-ink font-semibold">Why:</b> Scorpio water steadies Leo fire — polarity scores
          highest across all five romantic engines, with pacing as the one watch-item.
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-14 md:pt-24 pb-16 grid md:grid-cols-[1.05fr_1fr] gap-12 md:gap-16 items-center">
      <div>
        {/* Tag chip */}
        <div
          className="hero-in inline-flex items-center gap-2 rounded-full border border-hairline-accent bg-accent-soft/40 px-3.5 py-1.5 text-xs font-medium text-accent-bright mb-7"
        >
          <Star4 size={10} className="text-gold-bright" />
          18 deterministic engines · zero guesswork
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold tracking-[-0.035em] text-[42px] leading-[1.04] md:text-6xl text-ink select-none">
          Compatibility,
          <br />
          {GRAD_WORDS.map((word, wi) => (
            <span
              key={wi}
              className={`inline-block whitespace-nowrap ${wi < GRAD_WORDS.length - 1 ? "mr-[0.22em]" : ""}`}
            >
              {/* Animate the word, gradient the text inside it: background-clip:text
                  drops wrapped lines when transformed descendants sit under it. */}
              <span
                className="hero-in inline-block"
                style={{ "--hero-delay": `${(0.25 + wi * 0.09).toFixed(2)}s` } as CSSProperties}
              >
                <span className="text-gradient-accent">{word}</span>
              </span>
            </span>
          ))}
        </h1>

        {/* Subcopy */}
        <p
          style={{ "--hero-delay": "0.5s" } as CSSProperties}
          className="hero-in mt-6 text-ink-secondary text-base leading-relaxed max-w-[480px]"
        >
          ZodicogAI scores every framework — zodiac, MBTI, love styles, numerology —
          with deterministic engines, then has AI explain the result. Every claim
          traces to a number.
        </p>

        {/* CTAs */}
        <div
          style={{ "--hero-delay": "0.62s" } as CSSProperties}
          className="hero-in mt-9 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/analyze/hybrid"
            className="inline-flex items-center justify-center rounded-control px-7 py-3 min-h-[50px] text-base font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200 tap-highlight-none active:scale-[0.98]"
          >
            Get your reading
          </Link>
          <Link
            href="/analyze/romantic"
            className="inline-flex items-center justify-center gap-1.5 rounded-control px-7 py-3 min-h-[50px] text-base font-semibold text-ink-secondary border border-hairline hover:text-ink hover:border-hairline-strong transition-all duration-200 tap-highlight-none active:scale-[0.98]"
          >
            Check compatibility →
          </Link>
        </div>

        <p
          style={{ "--hero-delay": "0.85s" } as CSSProperties}
          className="hero-in mt-4.5 text-sm text-ink-muted"
        >
          No sign-up · results in seconds · free
        </p>
      </div>

      <LiveReadingPanel />
    </section>
  );
}
