import type { Metadata } from "next";
import Link from "next/link";
import { Hash, MessageCircle, Palette } from "lucide-react";
import ZodicognacMark from "@/components/ZodicognacMark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, Star4 } from "@/components/ui/glyphs";
import { Breadcrumb, CtaBand } from "@/components/blog/editorial";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3.5">
      <span className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
        <Star4 size={9} className="text-gold" />
        {children}
      </span>
      <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
    </div>
  );
}

const DIMENSIONS = [
  { icon: <Glyph name="aries" size={15} />,      label: "Zodiac + Decan",  desc: "108 archetypal profiles" },
  { icon: <Glyph name="sun" size={15} />,        label: "MBTI Cognition",  desc: "Function stack + behavioral vector" },
  { icon: <Glyph name="crescent" size={15} />,   label: "Emotional",       desc: "Attachment theory alignment" },
  { icon: <Glyph name="venus" size={15} />,      label: "Romantic",        desc: "Polarity + passion dynamics" },
  { icon: <Glyph name="mars" size={15} />,       label: "Sextrology",      desc: "Sexual archetypes + erotic compatibility" },
  { icon: <Glyph name="heart" size={15} />,      label: "Love Styles",     desc: "Lee's 6-style typology matrix" },
  { icon: <MessageCircle className="size-[15px]" />, label: "Love Languages", desc: "Chapman's 5 channels aligned" },
  { icon: <Hash className="size-[15px]" />,      label: "Numerology",      desc: "Pythagorean life path resonance" },
  { icon: <Palette className="size-[15px]" />,   label: "Aura Colors",     desc: "HSL color harmony in 3D space" },
  { icon: <Glyph name="infinity" size={15} />,   label: "Full Intelligence", desc: "10-dimension weighted synthesis" },
];

const PHILOSOPHY = [
  {
    title: "Respect complexity",
    body: "Human personality is multidimensional. A person is simultaneously their zodiac archetype, their MBTI function stack, their love language, their attachment style, and their life numerology. I don't reduce — I integrate.",
  },
  {
    title: "Grounding before generation",
    body: "Behind every insight is a deterministic engine: profiles are computed, compatibility matrices are fixed, feature scores are explicit. Large language models then interpret that structure — they don't invent it.",
  },
  {
    title: "Transparency",
    body: "Every score is reproducible. Enter the same birth date and MBTI type, get the same deterministic result. No hidden black boxes. You own your data; I own my methodology.",
  },
  {
    title: "Connection over prediction",
    body: "I don't claim to predict the future. I illuminate the present: your behavioral patterns, your partner's psychological landscape, the resonance (or friction) between you. Real relationship work happens in the space between insight and action.",
  },
];

const STACK: [string, string][] = [
  ["Backend", "FastAPI · Python 3.10 · Pydantic v2"],
  ["Frontend", "Next.js 16 · React 19 · Tailwind CSS v4"],
  ["LLM", "Gemini 2.5 Flash + 2.5 Flash Lite fallback"],
  ["Engines", "18 deterministic engines across 10 dimensions"],
  ["Oracle", "Zodicognac — session-aware conversational AI"],
  ["Visualization", "Recharts · Framer Motion · Canvas 2D"],
  ["Deployment", "IONOS VPS · Nginx · PM2"],
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      {/* Ambient gold crown */}
      <div
        className="absolute inset-x-0 top-0 h-[380px] -z-10 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(216,166,60,0.10) 0%, transparent 70%)" }}
      />

      <Breadcrumb trail={[{ href: "/", label: "Home" }, { label: "About" }]} />

      {/* Header */}
      <header className="mb-12">
        <Eyebrow>My story</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.06] text-ink">
          The birth of Zodicog.
        </h1>
        <p className="mt-4 text-lg text-ink-secondary leading-relaxed max-w-xl">
          A hybrid symbolic-generative system for compatibility, communication,
          and relationship intelligence — built by one person who couldn&apos;t stop
          asking why people work the way they do.
        </p>
      </header>

      <div className="space-y-14">
        {/* The journey */}
        <section>
          <SectionLabel>The journey</SectionLabel>
          <div className="space-y-4 text-[16px] leading-[1.75] text-ink-secondary max-w-prose">
            <p>
              For years, I&apos;ve been interested in zodiac systems, personality
              psychology, and relationship dynamics. I kept returning to the same
              question: what would it look like to build a single system that could
              integrate multiple frameworks of human behavior — zodiac, MBTI,
              attachment, love languages, numerology — into one structured, coherent
              model?
            </p>
            <p>
              Every tool I found was fragmented. Some focused only on zodiac
              archetypes. Others only on MBTI, or attachment styles, or love
              languages. Very few tried to model how these frameworks interact — and
              even fewer turned that structure into an explainable, user-facing
              experience.
            </p>
            <p>
              So in 2026, I built ZodicogAI. Not a generic relationship app, but a
              hybrid symbolic-generative platform that models personality and
              compatibility across ten structured dimensions simultaneously.
            </p>
          </div>

          {/* Pull quote */}
          <blockquote className="mt-7 rounded-card border border-hairline-gold bg-gold/[0.05] p-6 md:p-7">
            <p className="font-display font-extrabold text-xl md:text-[22px] tracking-[-0.02em] leading-snug text-ink">
              Grounding before generation —{" "}
              <span className="text-gold-bright">structure first, narrative second.</span>
            </p>
            <p className="mt-2.5 text-sm text-ink-secondary">
              Deterministic engines compute the scores. AI only interprets them. The
              model is not inventing facts — it is translating pre-computed symbolic
              data into readable insight.
            </p>
          </blockquote>
        </section>

        {/* How it works — pipeline band */}
        <section>
          <SectionLabel>How it works</SectionLabel>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { n: "01", title: "You share your details", body: "Birth date and MBTI type — nothing else needed." },
              { n: "02", title: "Engines compute", body: "18 deterministic engines score every framework before any AI runs." },
              { n: "03", title: "AI interprets", body: "Gemini writes the reading from your exact scores — grounded, reproducible." },
            ].map((s) => (
              <div key={s.n} className="rounded-card border border-hairline bg-white/[0.02] p-5">
                <p className="font-mono text-[11px] text-gold">{s.n}</p>
                <p className="mt-2 font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink">{s.title}</p>
                <p className="mt-1.5 text-[13.5px] text-ink-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Ten dimensions */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {DIMENSIONS.map((d) => (
              <div key={d.label} className="flex items-start gap-3 rounded-card border border-hairline bg-white/[0.02] p-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-control border border-hairline bg-gold/5 text-gold-bright">
                  {d.icon}
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink leading-tight">{d.label}</span>
                  <span className="block text-[11.5px] text-ink-muted mt-0.5">{d.desc}</span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[15px] leading-[1.7] text-ink-secondary max-w-prose">
            Beyond the analysis engines, ZodicogAI includes a{" "}
            <span className="text-gold-bright font-medium">360-profile Celebrity Database</span>{" "}
            — 30 profiles per zodiac sign, each with a full behavioral profile, life
            path number, aura color, and Wikipedia context. Because the best way to
            understand an archetypal pattern is to see it embodied in people you
            already know.
          </p>
        </section>

        {/* Zodicognac */}
        <section>
          <SectionLabel>Zodicognac — the oracle</SectionLabel>
          <div
            className="rounded-card border border-hairline-gold overflow-hidden p-6 md:p-8"
            style={{
              background:
                "radial-gradient(60% 100% at 10% 0%, rgba(216,166,60,0.10) 0%, transparent 60%), rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <ZodicognacMark size={20} active />
              <span className="font-display font-extrabold text-[12px] tracking-[0.22em] uppercase text-gold">
                Every serious system deserves a voice
              </span>
            </div>
            <div className="space-y-4 text-[15px] leading-[1.7] text-ink-secondary">
              <p>
                Zodicognac is a cosmic cognac — my own invention. A spirit distilled
                from the stars, aged in the barrel of behavioral science, and poured
                neat. Not a chatbot. Not a generic assistant. The conversational
                oracle at the heart of ZodicogAI: a purpose-built intelligence that
                knows your chart, remembers your session, and speaks with the
                directness of someone who has studied human psychology for a long
                time.
              </p>
              <p>
                Ask it about your shadow. Ask it whether you&apos;re self-sabotaging.
                Ask it whether you should reach out. It won&apos;t hedge, and it knows
                the structural difference between an INTJ Scorpio reaching out and an
                ENFP Sagittarius doing the same — because that difference is real.
              </p>
              <p>
                Sessions are continuous, and when you&apos;re done you can export the
                whole conversation. Some conversations are worth keeping.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-6 inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all tap-highlight-none"
            >
              Ask Zodicognac
            </Link>
          </div>
        </section>

        {/* Etymology */}
        <section>
          <SectionLabel>What does &ldquo;Zodicog&rdquo; mean?</SectionLabel>

          {/* Lockup */}
          <div className="rounded-card border border-hairline bg-white/[0.02] p-7 md:p-9 text-center mb-4">
            <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              <span className="font-display font-extrabold tracking-[-0.02em] text-2xl md:text-3xl text-ink">Zodiac</span>
              <span className="text-gold-bright text-xl md:text-2xl" aria-hidden="true">×</span>
              <span className="font-display font-extrabold tracking-[-0.02em] text-2xl md:text-3xl text-ink">Cognition</span>
            </div>
            <div className="my-4 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
              <Star4 size={10} className="text-gold" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="font-display font-extrabold tracking-[-0.02em] text-3xl md:text-4xl">
              <span className="text-ink">Zodicog</span>
              <span className="text-accent-bright">AI</span>
            </p>
            <p className="mt-3 text-sm text-ink-muted max-w-md mx-auto">
              The intersection of ancient stars and modern psychology — where
              mythology meets neuroscience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-card border border-hairline-gold bg-gold/[0.04] p-5">
              <p className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-gold-bright mb-1.5">Zodiac</p>
              <p className="text-[14px] text-ink-secondary leading-relaxed">
                The ancient 12-sign system encoding 4 elements, 3 modalities, and 12
                archetypal energies. The mythological layer of personality.
              </p>
            </div>
            <div className="rounded-card border border-hairline-accent bg-accent/[0.05] p-5">
              <p className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-accent-bright mb-1.5">Cognition</p>
              <p className="text-[14px] text-ink-secondary leading-relaxed">
                The psychological and neurological basis of how humans think, feel,
                perceive, and decide. The scientific layer. How minds work.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-card border border-hairline bg-white/[0.02] p-5">
            <p className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-ink-muted mb-1.5">
              The AI in ZodicogAI
            </p>
            <p className="font-display font-extrabold text-xl text-ink mb-2">Behavioral Intelligence.</p>
            <p className="text-[14px] text-ink-secondary leading-relaxed">
              Integrating multiple structured signal families — zodiac, MBTI,
              attachment, numerology, love styles, and others — into a single
              interpretable behavioral intelligence layer. Structured computation
              runs first. Language models interpret second.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section>
          <SectionLabel>My philosophy</SectionLabel>
          <div className="grid md:grid-cols-2 gap-3">
            {PHILOSOPHY.map((p) => (
              <div key={p.title} className="rounded-card border border-hairline bg-white/[0.02] p-5">
                <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.16em] uppercase text-gold-bright mb-2">
                  <Star4 size={9} />
                  {p.title}
                </p>
                <p className="text-[14px] text-ink-secondary leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section>
          <SectionLabel>The mission</SectionLabel>
          <div className="space-y-4 text-[16px] leading-[1.75] text-ink-secondary max-w-prose">
            <p>
              To make compatibility and behavioral intelligence more accessible,
              interpretable, and usable. Not isolated scores or generic advice — but
              a more coherent view of how multiple behavioral dimensions align,
              conflict, or reinforce one another in real relationships.
            </p>
            <p>
              ZodicogAI is an attempt to bring together symbolic frameworks,
              personality models, and modern AI into a single grounded system — one
              that gives people more depth and clarity in understanding themselves
              and the people they care about.
            </p>
          </div>
        </section>

        {/* Built with */}
        <section>
          <SectionLabel>Built with</SectionLabel>
          <p className="text-[15px] text-ink-secondary mb-5">
            Love, late nights, and an unhealthy obsession with why people work the
            way they do <span className="text-rose-400/70">♡</span> — and also these:
          </p>
          <div className="rounded-card border border-hairline bg-white/[0.02] divide-y divide-white/[0.05]">
            {STACK.map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-4 px-5 py-3">
                <span className="w-28 shrink-0 font-display font-extrabold text-[10.5px] tracking-[0.16em] uppercase text-ink-muted">
                  {label}
                </span>
                <span className="font-mono text-[12.5px] text-ink-secondary">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CtaBand
        text="Ready to explore your behavioral intelligence?"
        actions={[
          { href: "/analyze/hybrid", label: "Start Self Analysis", primary: true },
          { href: "/blog", label: "Read the Almanac" },
        ]}
      />
    </main>
  );
}
