import type { Metadata } from "next";
import Link from "next/link";

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

const FAQS: { q: string; a: string; link?: { text: string; href: string } }[] = [
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
    q: "What are the 5 love languages?",
    a: "Dr. Gary Chapman's 5 Love Languages are: Words of Affirmation (verbal praise and appreciation), Acts of Service (doing helpful things for your partner), Receiving Gifts (thoughtful presents as symbols of love), Quality Time (undivided attention and presence), and Physical Touch (physical affection and closeness). Understanding your partner's primary love language dramatically improves relationship satisfaction.",
    link: { text: "Find Your Love Language", href: "/analyze/love-language" },
  },
  {
    q: "What is sextrology?",
    a: "Sextrology is the study of how personality traits — especially zodiac and MBTI — influence intimacy, sexual character, erotic preferences, and long-term passion dynamics. It goes beyond taboo to give couples a language for discussing desires, pacing, and emotional needs in intimate contexts. ZodicogAI's Sextrology engine analyzes 6 dimensions including erogenous zones, fantasy profiles, and long-term fire.",
    link: { text: "Try Sextrology Analysis", href: "/analyze/sextrology" },
  },
  {
    q: "How accurate is AI relationship analysis?",
    a: "ZodicogAI's analyses are grounded in deterministic engines — the zodiac profiles, MBTI dynamics, and compatibility matrices are computed with fixed logic before any AI is involved. The AI (Google Gemini 2.5 Flash) then synthesizes these pre-computed scores into narrative insights. This hybrid approach means you get both reproducible, structured scores and rich qualitative interpretation.",
  },
  {
    q: "What is a life path number in numerology?",
    a: "Your life path number is calculated by reducing your birth date (day + month) to a single digit (or master number 11, 22, 33). It represents the core themes, lessons, and opportunities of your life journey. Life path 1 = The Leader, 2 = The Mediator, 3 = The Communicator, and so on. ZodicogAI also calculates your expression number from your name and computes a weighted compatibility score.",
    link: { text: "Try Numerology Analysis", href: "/analyze/numerology" },
  },
  {
    q: "What do the 6 love styles mean?",
    a: "The 6 love styles (from sociologist John Lee's research) are: Eros (passionate, romantic love), Storge (friendship-based love), Pragma (practical, compatible love), Ludus (playful, non-committal love), Mania (obsessive, intense love), and Agape (selfless, unconditional love). Most people have a dominant style and a secondary one. ZodicogAI scores both partners and reveals how their styles interact.",
    link: { text: "Discover Your Love Style", href: "/analyze/love-style" },
  },
  {
    q: "What is my aura color?",
    a: "In spiritual traditions, each person has an aura — an energetic field that reflects their personality, emotional state, and vibration. ZodicogAI maps each zodiac sign to a specific aura color with symbolic meaning (e.g., Scorpio = deep crimson, Libra = rose gold). For pairs, we compute a middle-ground blend color and a compatible color that harmonizes both auras.",
    link: { text: "Find Your Aura Color", href: "/analyze/color" },
  },
  {
    q: "What is synastry in astrology?",
    a: "Synastry is the comparison of two birth charts to assess relationship compatibility. It examines how the planets in one person's chart interact with the planets in another's. ZodicogAI's Full Relationship Intelligence report offers a 10-dimensional synastry analysis covering romantic compatibility, emotional bond, communication style, love language alignment, intimacy dynamics, and long-term potential.",
    link: { text: "Run Full Synastry Report", href: "/analyze/relationship-intelligence" },
  },
  {
    q: "What is the rarest zodiac sign?",
    a: "Ophiuchus is sometimes called the 13th zodiac sign (Nov 29 – Dec 17) though it is not used in Western astrology. Among the traditional 12 signs, Aquarius (Jan 20 – Feb 18) is statistically one of the rarest due to fewer births in mid-winter in the northern hemisphere. Scorpio and Virgo tend to be among the most common.",
  },
  {
    q: "What is the rarest MBTI type?",
    a: "INFJ is considered the rarest MBTI type, making up roughly 1-2% of the population. ENTJ and INTJ are also uncommon. The most common types tend to be ISFJ, ESFJ, and ISTJ — the 'Sentinel' role types associated with duty and service.",
    link: { text: "Read the INFJ Profile", href: "/blog/mbti/infj" },
  },
  {
    q: "Can I use ZodicogAI without knowing my MBTI type?",
    a: "Yes — ZodicogAI includes a built-in MBTI quiz with 8 questions that computes your type in real time. You can take the quiz directly within the analysis form. Alternatively, you can manually select any of the 16 types from the dropdown if you already know yours.",
    link: { text: "Start Self Analysis", href: "/analyze/hybrid" },
  },
  {
    q: "Is my data stored or shared?",
    a: "ZodicogAI does not store personal analysis data between sessions. Each analysis is computed in real time from the inputs you provide and is not retained on our servers beyond the response. No personal data is sold or shared with third parties.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">FAQ</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Frequently Asked</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Questions & Answers</h1>
        <p className="text-zinc-400 mt-1 text-sm">Everything about zodiac, MBTI, compatibility, and AI behavioral analysis</p>
      </div>

      <div className="space-y-6">
        {FAQS.map(({ q, a, link }, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-white mb-2">{q}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
            {link && (
              <Link href={link.href}
                className="inline-block mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                {link.text} →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
        <p className="text-zinc-300 mb-4">Ready to explore your behavioral intelligence?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/analyze/hybrid" className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
            Self Analysis
          </Link>
          <Link href="/analyze/romantic" className="px-5 py-2 rounded-full border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10 transition-colors">
            Compatibility
          </Link>
        </div>
      </div>
    </main>
  );
}
