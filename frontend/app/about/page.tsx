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
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          The Birth of Zodicog
        </h1>
        <p className="text-base text-amber-400 font-medium">
          A hybrid symbolic-generative system for compatibility, communication, and relationship intelligence.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: My Journey */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            My Journey
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            For years, I&apos;ve been interested in zodiac systems, personality
            psychology, and relationship dynamics. I kept returning to the same
            question: what would it look like to build a single system that
            could integrate multiple frameworks of human behavior — zodiac,
            MBTI, attachment, love languages, numerology — into one structured,
            coherent model?
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            Every tool I found was fragmented. Some focused only on zodiac
            archetypes. Others only on MBTI, or attachment styles, or love
            languages. Very few tried to model how these frameworks interact —
            and even fewer turned that structure into an explainable,
            user-facing experience.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            So in 2026, I built ZodicogAI. Not a generic relationship app, but
            a hybrid symbolic-generative platform that models personality and
            compatibility across ten structured dimensions simultaneously —
            and uses AI only to interpret those pre-computed outputs, not to
            invent them.
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
            it reproducible, auditable, and accessible. So I built ZodicogAI:
            a hybrid engine that synthesizes ten independent behavioral
            dimensions into a coherent whole.
          </p>
          <div className="grid grid-cols-2 gap-2 my-4">
            {[
              ["✦", "Zodiac + Decan", "108 archetypal profiles"],
              ["◈", "MBTI Cognition", "Function stack + behavioral vector"],
              ["♥", "Emotional", "Attachment theory alignment"],
              ["◉", "Romantic", "Polarity + passion dynamics"],
              ["⚡", "Sextrology", "Sexual archetypes + erotic compatibility"],
              ["♡", "Love Styles", "Lee's 6-style typology matrix"],
              ["◆", "Love Languages", "Chapman's 5 channels aligned"],
              ["∞", "Numerology", "Pythagorean life path resonance"],
              ["◎", "Aura Colors", "HSL color harmony in 3D space"],
              ["◐", "Full Intelligence", "10-dimension weighted synthesis"],
            ].map(([icon, label, desc]) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                <p className="text-xs font-semibold text-amber-300 mb-0.5">{icon} {label}</p>
                <p className="text-[11px] text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            The architecture is deliberate: deterministic engines compute
            structured outputs — archetypal profiles, compatibility matrices,
            weighted feature scores. Large language models then interpret those
            grounded outputs into narrative explanations. The model is not
            inventing facts. It is translating pre-computed symbolic data into
            readable insight.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            Beyond the analysis engines, ZodicogAI includes a{" "}
            <span className="text-amber-300 font-medium">
              360-profile Celebrity Database
            </span>{" "}
            — 30 profiles per zodiac sign, each with a full behavioral profile,
            life path number, aura color, and Wikipedia context. Because the
            best way to understand an archetypal pattern is to see it embodied
            in people you already know.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            The core principle:{" "}
            <span className="text-amber-300">
              grounding before generation — structure first, narrative second
            </span>
            .
          </p>
        </section>

        {/* Section 2b: Zodicognac */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-300">
            Zodicognac — The Oracle
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            Every serious system deserves a voice. Zodicognac is mine.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            Zodicognac is a cosmic cognac — my own invention. A spirit distilled
            from the stars, aged in the barrel of behavioral science, and poured
            neat. Not a chatbot. Not a generic assistant. The conversational
            oracle at the heart of ZodicogAI: a purpose-built intelligence that
            knows your chart, remembers your session, and speaks with the
            directness of someone who has studied human psychology for a long
            time.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            Ask it about your shadow. Ask it whether you&apos;re self-sabotaging.
            Ask it whether you should reach out. It won&apos;t hedge. It won&apos;t
            give you generic advice. And unlike any other AI I&apos;ve seen, it
            actually knows the structural difference between an INTJ Scorpio
            reaching out and an ENFP Sagittarius doing the same — because that
            difference is real.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Sessions are continuous — Zodicognac remembers everything you&apos;ve
            said in a conversation. When you&apos;re done, export the full session
            as a document. Some conversations are worth keeping.
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
          <p className="text-zinc-300 text-sm leading-relaxed mb-8">
            <span className="text-amber-300">Zodicog</span> = the intersection
            of ancient stars and modern psychology. Where mythology meets
            neuroscience.
          </p>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              The AI in ZodicogAI
            </p>
            <p className="text-2xl font-bold text-white mb-3">
              Behavioral Intelligence.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The{" "}
              <span className="text-amber-300 font-medium">AI</span> in
              ZodicogAI refers to the system&apos;s core function: integrating
              multiple structured signal families — zodiac, MBTI, attachment,
              numerology, love styles, and others — into a single interpretable
              behavioral intelligence layer. Structured computation runs first.
              Language models interpret second.
            </p>
          </div>
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
                Grounding Before Generation
              </p>
              <p className="text-sm text-zinc-300">
                Behind every insight is a deterministic engine: profiles are
                computed, compatibility matrices are fixed, feature scores are
                explicit. Large language models then interpret that structure —
                they don&apos;t invent it.
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
            To make compatibility and behavioral intelligence more accessible,
            interpretable, and usable. Not isolated scores or generic advice —
            but a more coherent view of how multiple behavioral dimensions align,
            conflict, or reinforce one another in real relationships.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            ZodicogAI is an attempt to bring together symbolic frameworks,
            personality models, and modern AI into a single grounded system —
            one that gives people more depth and clarity in understanding
            themselves and the people they care about.
          </p>
        </section>

        {/* Section 6: Built With */}
        <section>
          <h2 className="text-lg font-semibold mb-1 text-amber-300">
            Built with love, late nights, &amp; an unhealthy obsession with why people work the way they do <span className="text-rose-400/70">♡</span>
          </h2>
          <p className="text-xs text-zinc-500 mb-4">...and also these:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ["Backend", "FastAPI · Python 3.10 · Pydantic v2"],
              ["Frontend", "Next.js 16 · React 19 · Tailwind CSS v4"],
              ["LLM", "Gemini 2.5 Flash + 2.0 Flash Lite (fallback)"],
              ["Analysis Engines", "Zodiac · MBTI · Emotional · Romantic · Sextrology · Love Styles · Love Languages · Numerology · Aura Colors · Full Relationship Intelligence"],
              ["Personalities", "360 Celebrity Database · 16 MBTI Profiles · 12 Zodiac Articles"],
              ["Oracle", "Zodicognac — session-aware conversational AI"],
              ["Visualization", "Recharts · Framer Motion · Canvas 2D"],
              ["Analytics", "Google Analytics 4 · Search Console"],
              ["Deployment", "IONOS VPS · Nginx · PM2 · SSH"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                <p className="text-xs font-semibold text-zinc-400">{label}</p>
                <p className="text-xs text-zinc-500 mt-1">{value}</p>
              </div>
            ))}
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
