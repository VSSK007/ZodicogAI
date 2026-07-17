/**
 * AnalysisShowcase — every reading as an interactive tile, grouped You / Together.
 * Pulls from the shared analyses registry (lib/analyses.ts).
 */
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Glyph } from "@/components/ui/glyphs";
import { ANALYZE_YOU, ANALYZE_TOGETHER, type AnalyzeLink } from "@/lib/analyses";

function Tile({ link }: { link: AnalyzeLink }) {
  return (
    <Link
      href={link.href}
      className="group block rounded-card border border-hairline bg-white/[0.03] p-5 transition-all duration-200 hover:border-hairline-accent hover:bg-accent/5 hover:-translate-y-0.5 tap-highlight-none"
    >
      <span className="flex size-9 items-center justify-center rounded-control border border-hairline bg-gold/5 text-gold-bright mb-3.5 transition-colors group-hover:border-hairline-gold">
        {link.glyph ? <Glyph name={link.glyph} size={16} /> : link.icon ? <link.icon className="size-4" /> : null}
      </span>
      <span className="flex items-center justify-between">
        <span className="font-display font-extrabold text-[15.5px] tracking-[-0.01em] text-ink">
          {link.label}
        </span>
        <span
          className="text-ink-faint transition-all duration-200 group-hover:text-accent-bright group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          →
        </span>
      </span>
      <span className="mt-1.5 block text-[13px] text-ink-secondary leading-relaxed">{link.desc}</span>
    </Link>
  );
}

function Group({ title, links }: { title: string; links: AnalyzeLink[] }) {
  return (
    <>
      <div className="mt-10 mb-4 flex items-center gap-3.5">
        <span className="font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
          {title}
        </span>
        <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {links.map((link, i) => (
          <RevealOnScroll key={link.href} delay={i * 0.05} y={18}>
            <Tile link={link} />
          </RevealOnScroll>
        ))}
      </div>
    </>
  );
}

export default function AnalysisShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <SectionHeader eyebrow="The readings" title="Ten readings. One method." />
      </RevealOnScroll>
      <Group title="For you" links={ANALYZE_YOU} />
      <Group title="Together" links={ANALYZE_TOGETHER} />
    </section>
  );
}
