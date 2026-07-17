/**
 * TeaserRows — celebrity chips + blog topic cards.
 * Celebrity data is fully client-side (lib/celebrities.ts) — no API calls.
 */
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { CELEBRITIES, SIGN_LABEL, type Celebrity } from "@/lib/celebrities";

const FEATURED_SLUGS = [
  "zendaya",
  "taylor-swift",
  "dua-lipa",
  "timothee-chalamet",
  "sabrina-carpenter",
  "billie-eilish",
];

function featuredCelebs(): Celebrity[] {
  const bySlug = new Map(CELEBRITIES.map((c) => [c.slug, c]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(Boolean) as Celebrity[];
  // Top up from the full list if any featured slug is missing.
  for (const c of CELEBRITIES) {
    if (picked.length >= 6) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.slice(0, 6);
}

const BLOG_CARDS = [
  {
    href: "/blog",
    title: "The 12 signs, in depth",
    desc: "Editorial deep-dives on every zodiac sign — strengths, shadows, and matches.",
  },
  {
    href: "/blog",
    title: "All 16 MBTI types",
    desc: "How each type loves, fights, and commits — with famous examples.",
  },
  {
    href: "/blog/faq",
    title: "How the engines work",
    desc: "What we compute, what the AI writes, and why every score is explainable.",
  },
];

export default function TeaserRows() {
  const celebs = featuredCelebs();
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <SectionHeader
          eyebrow="Celebrity charts"
          title="The stars, studied."
          sub="360 celebrity charts, fully profiled — from life path to aura."
        />
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="mt-8 flex flex-wrap gap-3">
          {celebs.map((c) => (
            <Link
              key={c.slug}
              href={`/celebrities/${c.slug}`}
              className="flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.03] py-2 pl-2.5 pr-4.5 transition-colors hover:border-hairline-accent tap-highlight-none"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-hairline-gold/60 text-gold-bright">
                <Glyph name={c.sign as GlyphName} size={14} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-ink leading-tight">{c.name}</span>
                <span className="block text-[11px] text-ink-muted">{SIGN_LABEL[c.sign]}</span>
              </span>
            </Link>
          ))}
          <Link
            href="/celebrities"
            className="flex items-center rounded-full border border-hairline px-4.5 py-2 text-[13px] font-semibold text-ink-secondary hover:text-accent-bright hover:border-hairline-accent transition-colors tap-highlight-none"
          >
            All 360 →
          </Link>
        </div>
      </RevealOnScroll>

      <div className="mt-14 grid md:grid-cols-3 gap-3.5">
        {BLOG_CARDS.map((card, i) => (
          <RevealOnScroll key={card.title} delay={i * 0.07} y={18}>
            <Link
              href={card.href}
              className="group block h-full rounded-card border border-hairline bg-white/[0.03] p-5 transition-all duration-200 hover:border-hairline-accent hover:-translate-y-0.5 tap-highlight-none"
            >
              <span className="flex items-center justify-between font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink">
                {card.title}
                <span className="text-ink-faint transition-all group-hover:text-accent-bright group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
              <span className="mt-1.5 block text-[13px] text-ink-secondary leading-relaxed">{card.desc}</span>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
