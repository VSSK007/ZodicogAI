"use client";

/**
 * Homepage — the flagship marketing page.
 * Sections live in components/home/*. The ?zn=1 Zodicognac ritual overlay
 * is preserved: gold burn-in, then a hand-off to /chat.
 */
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import ZodicognacMark from "@/components/ZodicognacMark";
import { EASE_SPRING } from "@/lib/motion";
import Hero from "@/components/home/Hero";
import StatsStrip from "@/components/home/StatsStrip";
import HowItWorks from "@/components/home/HowItWorks";
import AnalysisShowcase from "@/components/home/AnalysisShowcase";
import LiveTeaser from "@/components/home/LiveTeaser";
import ZodicognacBand from "@/components/home/ZodicognacBand";
import TeaserRows from "@/components/home/TeaserRows";
import FinalCta from "@/components/home/FinalCta";
import RecentReadings from "@/components/home/RecentReadings";

const ZN_DURATION_MS = 2000;

function ZodicognacRitual() {
  const reduced = useReducedMotion();
  return (
    <div className="fixed inset-0 z-30 bg-surface flex flex-col items-center justify-center">
      {/* Gold burn glow */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(237,203,126,0.20) 0%, rgba(216,166,60,0.10) 45%, transparent 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1, 0.7, 1] }}
          transition={{ duration: 5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
        />
      )}

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE_SPRING }}
        className="flex flex-col items-center gap-5"
      >
        <ZodicognacMark size={56} active />
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gold-bright"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Zodicognac
        </h1>
      </motion.div>

      {/* Progress bar */}
      {!reduced && (
        <motion.div
          className="absolute bottom-16 md:bottom-0 left-0 right-0 h-px"
          style={{
            transformOrigin: "left",
            background:
              "linear-gradient(to right, rgba(237,203,126,0.8) 0%, rgba(216,166,60,0.4) 60%, transparent 100%)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: ZN_DURATION_MS / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
}

/**
 * Reads ?zn=1 and plays the ritual. Isolated in its own Suspense boundary so
 * useSearchParams doesn't force the marketing sections into CSR bailout —
 * they must server-render for SEO.
 */
function ZodicognacRitualController() {
  const [znMode, setZnMode] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("zn") === "1") {
      setZnMode(true);
      const t = setTimeout(() => router.replace("/chat"), ZN_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  return znMode ? <ZodicognacRitual /> : null;
}

export default function Home() {
  return (
    <main>
      <Suspense>
        <ZodicognacRitualController />
      </Suspense>

      <Hero />
      <RecentReadings />
      <StatsStrip />
      <HowItWorks />
      <AnalysisShowcase />
      <LiveTeaser />
      <ZodicognacBand />
      <TeaserRows />
      <FinalCta />
    </main>
  );
}
