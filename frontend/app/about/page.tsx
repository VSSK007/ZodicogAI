import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ZodicogAI — My Story & Mission | ZodicogAI",
  description:
    "Discover how ZodicogAI was born from the intersection of ancient astrology, modern psychology, and AI — and what Zodicog means.",
  keywords:
    "about ZodicogAI, Zodicog meaning, behavioral intelligence, zodiac MBTI AI",
  openGraph: {
    title: "About ZodicogAI",
    description:
      "The origin story of ZodicogAI and the meaning behind Zodicog.",
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
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-300">About</span>
      </nav>

      <div className="mb-12">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">
            My Story
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          The Birth of Zodicog
        </h1>
      </div>

      <div className="space-y-8">
        {/* Section 1: My Journey */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            My Journey
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            For years, I've been deeply invested in zodiac astrology,
            personality psychology, and relationship dynamics. I've studied the
            nuances of how a Scorpio ENFP moves through the world differently
            than a Gemini INFP — the layers of mythology, behavioral patterns,
            attachment styles, and sexual archetypes that make people truly
            unique.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            I searched endlessly for a tool that could synthesize all of this —
            one that honored both the ancient wisdom of the zodiac and the
            empirical rigor of modern psychology. Something that could layer
            MBTI, numerology, love languages, and attachment theory into a
            coherent whole. But every tool I found was fragmented: zodiac here,
            MBTI there, relationship advice somewhere else. No AI truly
            understood the intersection.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            So in 2026, I decided to build it myself. From scratch. Using years
            of research, experimentation, and accumulated knowledge across
            astrology, psychology, behavioral science, and AI. ZodicogAI is what
            emerged — not a generic relationship app, but a direct reflection of
            everything I've learned about how personality, mythology, and
            neuroscience collide in human connection.
          </p>
        </section>

        {/* Section 2: The Vision */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            The Vision
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            I realized that what was missing wasn't one tool — it was an entire
            framework. A system that could take everything I'd learned and make
            it reproducible, auditable, and accessible. So I built ZodicogAI: a
            hybrid engine that combines 10 independent behavioral dimensions
            (zodiac, MBTI, numerology, love styles, love languages, attachment
            theory, sexual archetypes, color harmony, emotional patterns, and
            communication styles) into a coherent whole.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            The architecture is straightforward: deterministic computation
            (zodiac profiles, MBTI types, compatibility matrices) grounded in
            years of research, plus AI synthesis to interpret and narrate those
            insights with warmth and specificity. The LLM isn't guessing — it's
            interpreting structured data I've carefully engineered.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            The core principle:{" "}
            <span className="text-amber-300">
              human connection deserves depth, not generic advice
            </span>
            .
          </p>
        </section>

        {/* Section 3: What is Zodicog? */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            What Does "Zodicog" Mean?
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            <span className="text-amber-300 font-semibold">Zodicog</span> is a
            portmanteau of two foundational elements:
          </p>
          <div className="space-y-3 mb-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Zodiac
              </p>
              <p className="text-sm text-zinc-300">
                The ancient 12-sign system encoding 4 elements, 3 modalities,
                and 12 archetypal energies. The mythological layer of
                personality.
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Cognition
              </p>
              <p className="text-sm text-zinc-300">
                The psychological and neurological basis of how humans think,
                feel, perceive, and decide. The scientific layer. How minds
                work.
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            <span className="text-amber-300">Zodicog</span> = the intersection
            of ancient stars and modern psychology. Where mythology meets
            neuroscience.
          </p>
        </section>

        {/* Section 4: My Philosophy */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            My Philosophy
          </h2>
          <div className="space-y-3">
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Respect Complexity
              </p>
              <p className="text-sm text-zinc-300">
                Human personality is multidimensional. A person is
                simultaneously their zodiac archetype, their MBTI function
                stack, their love language, their attachment style, and their
                life numerology. I don't reduce — I integrate.
              </p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Determinism + Generosity
              </p>
              <p className="text-sm text-zinc-300">
                Behind every insight is a deterministic engine: zodiac profiles
                are computed, MBTI types are parsed, compatibility matrices are
                fixed. Then AI enriches with narrative warmth, empathy, and
                nuance. Math + poetry.
              </p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Transparency
              </p>
              <p className="text-sm text-zinc-300">
                Every score is reproducible. Enter the same birth date and MBTI
                type, get the same deterministic result. No hidden black boxes.
                You own your data; I own my methodology.
              </p>
            </div>
            <div className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Connection Over Prediction
              </p>
              <p className="text-sm text-zinc-300">
                I don't claim to predict the future. I illuminate the present:
                your behavioral patterns, your partner's psychological
                landscape, the resonance (or friction) between you. Real
                relationship work happens in the space between insight and
                action.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: The Mission */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            My Mission
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            To democratize behavioral intelligence. To give every person —
            whether they're a relationship skeptic or a devoted astrology
            enthusiast — access to deep, personalized, multi-dimensional
            insights into themselves and their connections.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            In a world of surface-level dating apps and generic relationship
            advice, I built ZodicogAI to answer: What if I could go deeper? What
            if I honored both the mystery of the stars and the precision of
            psychology?
          </p>
        </section>

        {/* Section 6: Built With */}
        <section>
          <h2 className="text-lg font-semibold mb-1 text-amber-300">
            Built with love, late nights, &amp; an unhealthy obsession with why people work the way they do <span className="text-rose-400/70">♡</span>
          </h2>
          <p className="text-xs text-zinc-600 mb-4">...and also these:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Backend</p>
              <p className="text-xs text-zinc-500 mt-1">
                FastAPI · Python 3.10 · Pydantic v2
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Frontend</p>
              <p className="text-xs text-zinc-500 mt-1">
                Next.js 16 · React 19 · Tailwind CSS v4
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">AI</p>
              <p className="text-xs text-zinc-500 mt-1">
                Gemini 2.5 Flash + 2.0 Lite
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Engines</p>
              <p className="text-xs text-zinc-500 mt-1">
                Zodiac, MBTI, Numerology, Love Languages
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">Analytics</p>
              <p className="text-xs text-zinc-500 mt-1">
                Google Analytics 4 · Search Console
              </p>
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-zinc-400">
                Visualization
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Recharts · Framer Motion
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
        <p className="text-zinc-300 mb-4">
          Ready to explore your behavioral intelligence?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/analyze/hybrid"
            className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
          >
            Start Self Analysis
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2 rounded-full border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10 transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
