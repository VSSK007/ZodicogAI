/**
 * FinalCta — closing section.
 */
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function FinalCta() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
      <RevealOnScroll>
        <h2 className="font-display font-extrabold tracking-[-0.035em] text-4xl md:text-5xl leading-[1.08] text-ink text-balance">
          Your chart is already written.
          <br />
          <span className="text-gradient-accent">Read it properly.</span>
        </h2>
        <Link
          href="/analyze/hybrid"
          className="mt-9 inline-flex items-center justify-center rounded-control px-8 py-3 min-h-[50px] text-[15px] font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200 tap-highlight-none active:scale-[0.98]"
        >
          Get your reading
        </Link>
      </RevealOnScroll>
    </section>
  );
}
