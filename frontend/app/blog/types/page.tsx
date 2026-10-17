import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow, Breadcrumb } from "@/components/blog/editorial";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { SIGN_KEYS } from "@/lib/aspects";
import { SIGN_COLOR } from "@/lib/celebrities";
import { comboPath, MBTI_KEYS, signName } from "@/lib/combos";

export const metadata: Metadata = {
  title: "Zodiac × MBTI: All 192 Sign and Type Combinations | ZodicogAI",
  description:
    "What it means to be a Leo INTJ, a Pisces ENFP or any of the 192 zodiac sign and MBTI type combinations: strengths, blind spots, love and work.",
  alternates: { canonical: "https://zodicogai.com/blog/types" },
  openGraph: {
    title: "Zodiac × MBTI | ZodicogAI",
    description: "All 192 zodiac sign and MBTI type combinations.",
    url: "https://zodicogai.com/blog/types",
    siteName: "ZodicogAI",
    type: "website",
  },
};

export default function TypesHub() {
  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-6xl mx-auto">
      <AmbientGlow hex="#a99bff" />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Sign × type" }]} />

      <header className="mb-10 max-w-2xl">
        <Eyebrow>192 combinations</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink text-balance">
          Your sign, your type, together
        </h1>
        <p className="mt-4 text-ink-secondary leading-relaxed">
          A Leo INTJ and a Leo ENFP share a sign and almost nothing else. Pick yours: each guide shows how closely the
          sign and the type line up (from our engines) and what the mix means for love and work.
        </p>
      </header>

      <div className="space-y-8">
        {SIGN_KEYS.map((sign) => (
          <section key={sign} aria-labelledby={`h-${sign}`}>
            <h2 id={`h-${sign}`} className="flex items-center gap-2.5 font-display font-extrabold text-lg text-ink mb-3">
              <span style={{ color: SIGN_COLOR[sign] }}>
                <Glyph name={sign as GlyphName} size={20} strokeWidth={1.6} />
              </span>
              {signName(sign)}
            </h2>
            <ul className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {MBTI_KEYS.map((t) => (
                <li key={t}>
                  <Link
                    href={comboPath(sign, t)}
                    prefetch={false}
                    className="block rounded-lg border border-hairline bg-white/[0.02] py-2 text-center text-xs font-mono font-semibold text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors tap-highlight-none"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
