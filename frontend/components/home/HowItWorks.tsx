/**
 * HowItWorks — the three-step pipeline, leaning into the real differentiator:
 * deterministic scoring first, AI explanation second.
 */
import RevealOnScroll from "@/components/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    n: "01",
    title: "Share your details",
    body: "Birth date and MBTI type — yours, or both of you. No sign-up, no email, thirty seconds.",
  },
  {
    n: "02",
    title: "Engines score everything",
    body: "18 deterministic engines rate zodiac, MBTI, love styles, love languages, numerology, and aura — before any AI is involved.",
  },
  {
    n: "03",
    title: "AI explains why",
    body: "Gemini interprets your exact scores — grounded, specific, never generic horoscope copy.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <SectionHeader
          eyebrow="How it works"
          title="Scored first. Explained second."
          sub="Most astrology apps generate vibes. ZodicogAI runs your chart through real scoring — the AI never writes a word until the math is done."
        />
      </RevealOnScroll>
      <div className="mt-11 grid md:grid-cols-3 gap-4">
        {STEPS.map((step, i) => (
          <RevealOnScroll key={step.n} delay={i * 0.08} className="relative">
            <Card className="p-6 h-full">
              <p className="font-mono text-[11px] text-gold">{step.n}</p>
              <h3 className="mt-2.5 mb-2 font-display font-extrabold text-[17px] tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="text-[13.5px] text-ink-secondary leading-relaxed">{step.body}</p>
            </Card>
            {i < STEPS.length - 1 && (
              <span
                className="hidden md:block absolute -right-[13px] top-1/2 -translate-y-1/2 text-ink-faint text-sm z-10"
                aria-hidden="true"
              >
                →
              </span>
            )}
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
