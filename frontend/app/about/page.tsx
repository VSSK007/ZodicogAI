import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ZodicogAI — Our Story & Mission | ZodicogAI",
  description: "Discover how ZodicogAI was born from the intersection of ancient astrology, modern psychology, and AI — and what Zodicog means.",
  keywords: "about ZodicogAI, Zodicog meaning, behavioral intelligence, zodiac MBTI AI",
  openGraph: {
    title: "About ZodicogAI",
    description: "The origin story of ZodicogAI and the meaning behind Zodicog.",
    url: "https://zodicogai.com/about",
    siteName: "ZodicogAI",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-300">About</span>
      </nav>

      <div className="mb-12">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Our Story</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">The Birth of Zodicog</h1>
      </div>

      <div className="space-y-8">
        {/* Section 1: The Problem */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">The Problem</h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            In 2023, as AI became ubiquitous, a stark realization emerged: modern personality systems were scattered. Generic AI couldn't understand the nuance of how a Scorpio ENFP moves through relationships differently than a Gemini INFP. Zodiac astrology offered symbolic depth but lacked scientific rigor. MBTI provided framework but missed the mythological and elemental dimensions of human nature. Love languages existed in isolation from behavioral types.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            No tool bridged ancient wisdom with modern psychology. No AI spoke the language of both the stars and the psyche.
          </p>
        </section>

        {/* Section 2: The Insight */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">The Insight</h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            What if we could harness the symbolic power of zodiac, the empirical structure of MBTI, the neurological basis of attachment styles, and the generative ability of modern LLMs to create a comprehensive behavioral intelligence system?
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            ZodicogAI was born from this collision: a hybrid engine combining deterministic behavioral matrices (zodiac profiles, MBTI types, numerology, love languages) with AI synthesis to generate deeply personalized relationship insights.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            The core principle: <span className="text-amber-300">human connection deserves depth, not generic advice</span>.
          </p>
        </section>

        {/* Section 3: What is Zodicog? */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">What Does "Zodicog" Mean?</h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            <span className="text-amber-300 font-semibold">Zodicog</span> is a portmanteau of three foundational elements:
          </p>
          <div className="space-y-3 mb-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">Zodiac</p>
              <p className="text-sm text-zinc-300">The ancient 12-sign system encoding 4 elements, 3 modalities, and 12 archetypal energies. The mythological layer of personality.</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">Cognition</p>
              <p className="text-sm text-zinc-300">The psychological and neurological basis of how humans think, feel, perceive, and decide. The scientific layer.</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">-og (Suffix)</p>
              <p className="text-sm text-zinc-300">From "logos" — the guiding principle, the underlying logic. The philosophical layer that unifies zodiac + cognition.</p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed text-italic">
            <span className="text-amber-300">Zodicog</span> = the logic that bridges ancient stars with modern minds.
          </p>
        </section>

        {/* Section 4: Our Philosophy */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">Our Philosophy</h2>
          <div className="space-y-3">
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Respect Complexity</p>
              <p className="text-sm text-zinc-300">Human personality is multidimensional. A person is simultaneously their zodiac archetype, their MBTI function stack, their love language, their attachment style, and their life numerology. We don't reduce — we integrate.</p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Determinism + Generosity</p>
              <p className="text-sm text-zinc-300">Behind every insight is a deterministic engine: zodiac profiles are computed, MBTI types are parsed, compatibility matrices are fixed. Then AI enriches with narrative warmth, empathy, and nuance. Math + poetry.</p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Transparency</p>
              <p className="text-sm text-zinc-300">Every score is reproducible. Enter the same birth date and MBTI type, get the same deterministic result. No hidden black boxes. You own your data; we own our methodology.</p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Connection Over Prediction</p>
              <p className="text-sm text-zinc-300">We don't claim to predict the future. We illuminate the present: your behavioral patterns, your partner's psychological landscape, the resonance (or friction) between you. Real relationship work happens in the space between insight and action.</p>
            </div>
          </div>
        </section>

        {/* Section 5: The Mission */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">Our Mission</h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            To democratize behavioral intelligence. To give every person — whether they're a relationship skeptic or a devoted astrology enthusiast — access to deep, personalized, multi-dimensional insights into themselves and their connections.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            In a world of surface-level dating apps and generic relationship advice, ZodicogAI asks: What if we could go deeper? What if we honored both the mystery of the stars and the precision of psychology?
          </p>
        </section>

        {/* Section 6: Built With */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Backend</p>
              <p className="text-xs text-zinc-500 mt-1">FastAPI · Python 3.10 · Pydantic v2</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Frontend</p>
              <p className="text-xs text-zinc-500 mt-1">Next.js 16 · React 19 · Tailwind CSS v4</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">AI</p>
              <p className="text-xs text-zinc-500 mt-1">Gemini 2.5 Flash + 2.0 Lite</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Engines</p>
              <p className="text-xs text-zinc-500 mt-1">Zodiac, MBTI, Numerology, Love Languages</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Analytics</p>
              <p className="text-xs text-zinc-500 mt-1">Google Analytics 4 · Search Console</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Visualization</p>
              <p className="text-xs text-zinc-500 mt-1">Recharts · Framer Motion</p>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
        <p className="text-zinc-300 mb-4">Ready to explore your behavioral intelligence?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/analyze/hybrid" className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
            Start Self Analysis
          </Link>
          <Link href="/blog" className="px-5 py-2 rounded-full border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10 transition-colors">
            Read Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
