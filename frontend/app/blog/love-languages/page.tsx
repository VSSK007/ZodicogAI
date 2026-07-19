import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Wrench, Gift, Clock, Hand } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Breadcrumb } from "@/components/blog/editorial";

export const metadata: Metadata = {
  title: "The 5 Love Languages Explained — Guide | ZodicogAI",
  description: "Understand all 5 love languages: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, and Physical Touch. Deep guides on each.",
  keywords: "love languages, words of affirmation, acts of service, quality time, physical touch, receiving gifts",
};

const LOVE_LANGS = [
  { slug: "words-of-affirmation", label: "Words of Affirmation", icon: MessageCircle, desc: "Verbal praise, appreciation, and encouragement" },
  { slug: "acts-of-service",      label: "Acts of Service",       icon: Wrench,       desc: "Actions that show love through helpful deeds" },
  { slug: "receiving-gifts",      label: "Receiving Gifts",       icon: Gift,         desc: "Thoughtful presents as symbols of love" },
  { slug: "quality-time",         label: "Quality Time",          icon: Clock,        desc: "Undivided attention and meaningful presence" },
  { slug: "physical-touch",       label: "Physical Touch",        icon: Hand,         desc: "Physical affection and closeness" },
];

export default function LoveLangIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Love Languages" }]} />
      <div className="mb-10">
        <Eyebrow>Relationship guides</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl leading-[1.08] text-ink">
          The 5 love languages
        </h1>
        <p className="mt-2.5 text-ink-secondary">Dr. Gary Chapman&apos;s framework for how people give and receive love.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LOVE_LANGS.map((l) => (
          <Link
            key={l.slug}
            href={`/blog/love-languages/${l.slug}`}
            className="group rounded-card border border-hairline bg-white/[0.02] p-5 transition-all duration-200 hover:border-hairline-gold hover:-translate-y-0.5 flex items-start gap-4 tap-highlight-none"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-hairline bg-gold/5 text-gold-bright transition-colors group-hover:border-hairline-gold">
              <l.icon className="size-[18px]" />
            </span>
            <span>
              <span className="block font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink">{l.label}</span>
              <span className="mt-1 block text-[13px] text-ink-secondary leading-relaxed">{l.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
