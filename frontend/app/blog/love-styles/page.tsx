import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Leaf, Scale, Dice5, Wind, Sparkles } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Breadcrumb } from "@/components/blog/editorial";

export const metadata: Metadata = {
  title: "The 6 Love Styles Explained — Guide | ZodicogAI",
  description: "Explore all 6 love styles from John Lee's color wheel of love: Eros, Storge, Pragma, Ludus, Mania, and Agape.",
  keywords: "love styles, eros, storge, pragma, ludus, mania, agape, color wheel of love",
};

const STYLES = [
  { slug: "eros",   label: "Eros",   icon: Flame,    desc: "Passionate, romantic, attraction-driven love", color: "#f87171" },
  { slug: "storge", label: "Storge", icon: Leaf,     desc: "Friendship-based, slow-growing love",          color: "#34d399" },
  { slug: "pragma", label: "Pragma", icon: Scale,    desc: "Practical, compatible, long-term love",        color: "#60a5fa" },
  { slug: "ludus",  label: "Ludus",  icon: Dice5,    desc: "Playful, flirtatious, non-committal love",     color: "#edcb7e" },
  { slug: "mania",  label: "Mania",  icon: Wind,     desc: "Obsessive, intense, jealousy-driven love",     color: "#a78bfa" },
  { slug: "agape",  label: "Agape",  icon: Sparkles, desc: "Selfless, unconditional, giving love",         color: "#fb923c" },
];

export default function LoveStyleIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Love Styles" }]} />
      <div className="mb-10">
        <Eyebrow>Relationship guides</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl leading-[1.08] text-ink">
          The 6 love styles
        </h1>
        <p className="mt-2.5 text-ink-secondary">John Alan Lee&apos;s color wheel theory of love (1973).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {STYLES.map((s) => (
          <Link
            key={s.slug}
            href={`/blog/love-styles/${s.slug}`}
            className="group rounded-card border p-5 transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-4 tap-highlight-none"
            style={{ borderColor: `${s.color}25`, background: `${s.color}08` }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control border" style={{ borderColor: `${s.color}40`, background: `${s.color}14`, color: s.color }}>
              <s.icon className="size-[18px]" />
            </span>
            <span>
              <span className="block font-display font-extrabold text-[15px] tracking-[-0.01em]" style={{ color: s.color }}>{s.label}</span>
              <span className="mt-1 block text-[13px] text-ink-secondary leading-relaxed">{s.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
