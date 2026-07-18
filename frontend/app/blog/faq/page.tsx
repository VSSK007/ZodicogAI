import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ZodicognacMark from "@/components/ZodicognacMark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Star4 } from "@/components/ui/glyphs";
import { Breadcrumb } from "@/components/blog/editorial";

export const metadata: Metadata = {
  title: "FAQ — Zodiac, MBTI & Relationship Intelligence | ZodicogAI",
  description: "Answers to the most common questions about zodiac compatibility, MBTI personality types, love languages, numerology, sextrology, and AI relationship analysis.",
  keywords: "zodiac FAQ, MBTI questions, relationship compatibility FAQ, love language FAQ, numerology FAQ, astrology AI",
  openGraph: {
    title: "FAQ | ZodicogAI",
    description: "Everything you need to know about zodiac signs, MBTI, compatibility, and AI behavioral analysis.",
    url: "https://zodicogai.com/blog/faq",
    siteName: "ZodicogAI",
    type: "article",
  },
};

interface Faq {
  q: string;
  a: string;
  link?: { text: string; href: string };
}

const GROUPS: { title: string; faqs: Faq[] }[] = [
  {
    title: "The method",
    faqs: [
      {
        q: "How does zodiac compatibility work?",
        a: "Zodiac compatibility is based on the elemental and modal relationships between signs. Fire and Air signs tend to energize each other, while Earth and Water signs share a deep emotional grounding. ZodicogAI goes further — we combine planetary rulership, modality (Cardinal, Fixed, Mutable), and AI-generated behavioral profiles to score compatibility across romantic, emotional, and long-term dimensions.",
        link: { text: "Try Romantic Compatibility", href: "/analyze/romantic" },
      },
      {
        q: "What is MBTI and how reliable is it?",
        a: "MBTI (Myers-Briggs Type Indicator) categorizes people into 16 personality types based on four dimensions: Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving. While no personality framework is 100% predictive, MBTI offers powerful insights into how people communicate, make decisions, and form attachments. ZodicogAI layers MBTI with zodiac data for a richer, multi-dimensional behavioral model.",
        link: { text: "Explore MBTI Types", href: "/blog/mbti/intj" },
      },
      {
        q: "How accurate is AI relationship analysis?",
        a: "ZodicogAI's analyses are grounded in deterministic engines — the zodiac profiles, MBTI dynamics, and compatibility matrices are computed with fixed logic before any AI is involved. The AI (Google Gemini 2.5 Flash) then synthesizes these pre-computed scores into narrative insights. This hybrid approach means you get both reproducible, structured scores and rich qualitative interpretation.",
      },
      {
        q: "What is synastry in astrology?",
        a: "Synastry is the comparison of two birth charts to assess relationship compatibility. It examines how the planets in one person's chart interact with the planets in another's. ZodicogAI's Full Relationship Intelligence report offers a 10-dimensional synastry analysis covering romantic compatibility, emotional bond, communication style, love language alignment, intimacy dynamics, and long-term potential.",
        link: { text: "Run Full Synastry Report", href: "/dashboard" },
      },
    ],
  },
  {
    title: "The frameworks",
    faqs: [
      {
        q: "What are the 5 love languages?",
        a: "Dr. Gary Chapman's 5 Love Languages are: Words of Affirmation (verbal praise and appreciation), Acts of Service (doing helpful things for your partner), Receiving Gifts (thoughtful presents as symbols of love), Quality Time (undivided attention and presence), and Physical Touch (physical affection and closeness). Understanding your partner's primary love language dramatically improves relationship satisfaction.",
        link: { text: "Find Your Love Language", href: "/analyze/love-language" },
      },
      {
        q: "What do the 6 love styles mean?",
        a: "The 6 love styles (from sociologist John Lee's research) are: Eros (passionate, romantic love), Storge (friendship-based love), Pragma (practical, compatible love), Ludus (playful, non-committal love), Mania (obsessive, intense love), and Agape (selfless, unconditional love). Most people have a dominant style and a secondary one. ZodicogAI scores both partners and reveals how their styles interact.",
        link: { text: "Discover Your Love Style", href: "/analyze/love-style" },
      },
      {
        q: "What is sextrology?",
        a: "Sextrology is the study of how personality traits — especially zodiac and MBTI — influence intimacy, sexual character, erotic preferences, and long-term passion dynamics. It goes beyond taboo to give couples a language for discussing desires, pacing, and emotional needs in intimate contexts. ZodicogAI's Sextrology engine analyzes 6 dimensions including erogenous zones, fantasy profiles, and long-term fire.",
        link: { text: "Try Sextrology Analysis", href: "/analyze/sextrology" },
      },
      {
        q: "What is a life path number in numerology?",
        a: "Your life path number is calculated by reducing your birth date (day + month) to a single digit (or master number 11, 22, 33). It represents the core themes, lessons, and opportunities of your life journey. Life path 1 = The Leader, 2 = The Mediator, 3 = The Communicator, and so on. ZodicogAI also calculates your expression number from your name and computes a weighted compatibility score.",
        link: { text: "Try Numerology Analysis", href: "/analyze/numerology" },
      },
      {
        q: "What is my aura color?",
        a: "In spiritual traditions, each person has an aura — an energetic field that reflects their personality, emotional state, and vibration. ZodicogAI maps each zodiac sign to a specific aura color with symbolic meaning (e.g., Scorpio = deep crimson, Libra = rose gold). For pairs, we compute a middle-ground blend color and a compatible color that harmonizes both auras.",
        link: { text: "Find Your Aura Color", href: "/analyze/color" },
      },
    ],
  },
  {
    title: "Curiosities",
    faqs: [
      {
        q: "What is the rarest zodiac sign?",
        a: "Ophiuchus is sometimes called the 13th zodiac sign (Nov 29 – Dec 17) though it is not used in Western astrology. Among the traditional 12 signs, Aquarius (Jan 20 – Feb 18) is statistically one of the rarest due to fewer births in mid-winter in the northern hemisphere. Scorpio and Virgo tend to be among the most common.",
      },
      {
        q: "What is the rarest MBTI type?",
        a: "INFJ is considered the rarest MBTI type, making up roughly 1-2% of the population. ENTJ and INTJ are also uncommon. The most common types tend to be ISFJ, ESFJ, and ISTJ — the 'Sentinel' role types associated with duty and service.",
        link: { text: "Read the INFJ Profile", href: "/blog/mbti/infj" },
      },
    ],
  },
  {
    title: "Practical & privacy",
    faqs: [
      {
        q: "Can I use ZodicogAI without knowing my MBTI type?",
        a: "Yes — ZodicogAI includes a built-in MBTI quiz with 8 questions that computes your type in real time. You can take the quiz directly within the analysis form. Alternatively, you can manually select any of the 16 types from the dropdown if you already know yours.",
        link: { text: "Start Self Analysis", href: "/analyze/hybrid" },
      },
      {
        q: "Is my data stored or shared?",
        a: "Analyses are computed in real time from the inputs you provide. Results are only saved if you choose to create a share link, and reading history lives in your own browser's storage. No personal data is sold or shared with third parties.",
      },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) => g.faqs).map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "FAQ" }]} />

      <div className="mb-11">
        <Eyebrow>Frequently asked</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-[44px] leading-[1.08] text-ink">
          Questions, answered plainly.
        </h1>
        <p className="mt-3.5 text-ink-secondary max-w-xl">
          How the engines score, what the frameworks mean, and what happens to your data.
        </p>
      </div>

      <div className="space-y-10">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <div className="mb-4 flex items-center gap-3.5">
              <span className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
                <Star4 size={9} className="text-gold" />
                {group.title}
              </span>
              <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
            </div>

            <div className="space-y-2.5">
              {group.faqs.map(({ q, a, link }) => (
                <details
                  key={q}
                  className="group rounded-card border border-hairline bg-white/[0.02] open:border-hairline-accent open:bg-white/[0.03] transition-colors"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden tap-highlight-none">
                    <span className="text-[15px] font-semibold text-ink">{q}</span>
                    <ChevronDown
                      className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180 group-open:text-gold-bright"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-[14.5px] text-ink-secondary leading-[1.7]">{a}</p>
                    {link && (
                      <Link
                        href={link.href}
                        className="mt-3 inline-block text-sm font-semibold text-gold-bright hover:text-gold transition-colors"
                      >
                        {link.text} →
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Zodicognac funnel */}
      <div
        className="mt-14 rounded-card border border-hairline-gold overflow-hidden p-7 text-center"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(216,166,60,0.10) 0%, transparent 65%), rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex justify-center mb-3">
          <ZodicognacMark size={26} active />
        </div>
        <p className="font-display font-extrabold text-lg tracking-[-0.02em] text-ink">
          Still curious?
        </p>
        <p className="mt-1.5 text-sm text-ink-secondary max-w-sm mx-auto">
          Zodicognac has already read every chart in the house. Ask it what an FAQ can&apos;t answer.
        </p>
        <Link
          href="/chat"
          className="mt-5 inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all tap-highlight-none"
        >
          Ask Zodicognac
        </Link>
      </div>
    </main>
  );
}
