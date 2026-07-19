import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Star4 } from "@/components/ui/glyphs";
import { Breadcrumb } from "@/components/blog/editorial";

export const metadata: Metadata = {
  title: "Numerology Life Path Numbers — Complete Guide | ZodicogAI",
  description: "Explore all numerology life path numbers 1-9 plus master numbers 11, 22, 33. Discover what your life path number reveals about your personality, love, and purpose.",
  keywords: "numerology life path, life path number meanings, master numbers, numerology guide",
};

const NUMBERS = [
  { n: "1", label: "The Leader",       theme: "Independence & Ambition" },
  { n: "2", label: "The Mediator",     theme: "Harmony & Partnership" },
  { n: "3", label: "The Communicator", theme: "Creativity & Expression" },
  { n: "4", label: "The Builder",      theme: "Discipline & Foundation" },
  { n: "5", label: "The Explorer",     theme: "Freedom & Change" },
  { n: "6", label: "The Nurturer",     theme: "Responsibility & Love" },
  { n: "7", label: "The Seeker",       theme: "Wisdom & Introspection" },
  { n: "8", label: "The Powerhouse",   theme: "Ambition & Material Mastery" },
  { n: "9", label: "The Humanitarian", theme: "Compassion & Completion" },
  { n: "11", label: "Master Intuitive", theme: "Spiritual Illumination", master: true },
  { n: "22", label: "Master Builder",   theme: "Manifesting the Impossible", master: true },
  { n: "33", label: "Master Teacher",   theme: "Healing & Unconditional Love", master: true },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3.5">
      <span className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
        <Star4 size={9} className="text-gold" />
        {children}
      </span>
      <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
    </div>
  );
}

export default function NumerologyBlogIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Numerology" }]} />
      <div className="mb-10">
        <Eyebrow>Numerology guides</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl leading-[1.08] text-ink">
          Life path numbers
        </h1>
        <p className="mt-2.5 text-ink-secondary">9 core numbers plus 3 master numbers — what your life path reveals.</p>
      </div>

      <section className="mb-10">
        <SectionLabel>Core numbers (1–9)</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NUMBERS.filter((n) => !n.master).map((n) => (
            <Link
              key={n.n}
              href={`/blog/numerology/${n.n}`}
              className="group rounded-card border border-hairline bg-white/[0.02] p-4 transition-all duration-200 hover:border-hairline-gold hover:-translate-y-0.5 tap-highlight-none"
            >
              <div className="font-display font-extrabold text-3xl text-gold-bright mb-1">{n.n}</div>
              <div className="text-[13.5px] font-semibold text-ink group-hover:text-gold-bright transition-colors">{n.label}</div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">{n.theme}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Master numbers</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NUMBERS.filter((n) => n.master).map((n) => (
            <Link
              key={n.n}
              href={`/blog/numerology/${n.n}`}
              className="group rounded-card border border-hairline-accent bg-accent/[0.05] p-4 transition-all duration-200 hover:-translate-y-0.5 tap-highlight-none"
            >
              <div className="font-display font-extrabold text-3xl text-accent-bright mb-1">{n.n}</div>
              <div className="text-[13.5px] font-semibold text-ink group-hover:text-accent-bright transition-colors">{n.label}</div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">{n.theme}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
