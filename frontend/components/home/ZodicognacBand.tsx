/**
 * ZodicognacBand — feature band for the Zodicognac chat.
 * Static "Private session" sample exchange (no API call), gold CTA → /chat.
 */
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ZodicognacMark from "@/components/ZodicognacMark";

export default function ZodicognacBand() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <div
          className="rounded-card border border-hairline-gold overflow-hidden grid md:grid-cols-2 items-center"
          style={{
            background:
              "radial-gradient(60% 90% at 8% 0%, rgba(216,166,60,0.10) 0%, transparent 60%), linear-gradient(140deg, rgba(139,124,246,0.07), rgba(255,255,255,0.02) 55%)",
          }}
        >
          {/* Copy */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-gold mb-4">
              <ZodicognacMark size={13} active />
              Zodicognac
            </div>
            <h2 className="font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.1] text-ink text-balance">
              Zodicognac has already read your chart
            </h2>
            <p className="mt-4 text-ink-secondary max-w-[400px] leading-relaxed">
              Ask it anything. It answers from your actual chart and engine scores —
              not recycled horoscope lines.
            </p>
            <Link
              href="/chat"
              className="mt-7 inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all duration-200 tap-highlight-none active:scale-[0.98]"
            >
              Ask Zodicognac
            </Link>
          </div>

          {/* Private session card */}
          <div className="px-6 pb-6 md:p-8">
            <div className="rounded-card border border-hairline bg-surface/75">
              <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
                <span className="flex items-center gap-2 font-display font-extrabold text-[10.5px] tracking-[0.2em] uppercase text-gold">
                  <ZodicognacMark size={11} active />
                  Private session
                </span>
                <span className="text-[11px] text-ink-muted">your chart · in context</span>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-ink-muted mb-3">
                  You asked — <b className="text-ink-secondary font-semibold">"Why do I keep falling for Scorpios?"</b>
                </p>
                <p className="text-[14.5px] text-ink leading-relaxed">
                  Because your chart rewards intensity. Your emotional engine rates depth
                  over stability <span className="text-gold-bright font-semibold">two to one</span> —
                  Scorpio is simply the sign that keeps up. Watch the pacing gap
                  (<span className="text-gold-bright font-semibold">76</span>): they commit
                  slower than you do.
                  <span
                    className="inline-block w-[7px] h-[14px] bg-gold-bright rounded-[1px] align-[-2px] ml-0.5 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
