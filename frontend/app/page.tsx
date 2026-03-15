"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import HybridForm from "../components/HybridForm";
import CompatibilityForm from "../components/CompatibilityForm";
import ZodicogMark from "../components/ZodicogMark";
import ZodicognacMark from "../components/ZodicognacMark";
import { EASE, EASE_SPRING, charReveal } from "@/lib/motion";

// Split once at module level — stable reference, no re-computation per render.
const TITLE_CHARS = "ZodicogAI".split("");

// How long the Zodicognac slow-burn lasts before redirecting to /chat.
const ZN_DURATION_MS = 5200;

function HomeContent() {
  const [mode, setMode] = useState<"hybrid" | "compatibility">("hybrid");
  const [znMode, setZnMode] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (searchParams.get("zn") === "1") {
      setZnMode(true);
      const t = setTimeout(() => router.replace("/chat"), ZN_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  return (
    <main className="px-5 md:px-8 py-0 md:py-32">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      {/* Mobile: full-screen centered hero. Desktop: normal top-padded hero. */}
      <div className="min-h-[calc(100dvh-64px)] md:min-h-0 flex flex-col justify-center md:block max-w-4xl mx-auto text-center mb-0 md:mb-24 relative pt-8 md:pt-0">

        {/* Email + GitHub — mobile homepage only, top of screen */}
        {!znMode && (
          <div className="md:hidden absolute top-3 left-0 right-0 flex items-center justify-center gap-3">
            <a
              href="mailto:kar1mr@zodicogai.com"
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
              title="kar1mr@zodicogai.com"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
            <span className="text-zinc-700 text-[10px]">·</span>
            <a
              href="https://github.com/VSSK007/ZodicogAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="VSSK007/ZodicogAI"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          </div>
        )}

        {/*
          Normal mode: blue/violet breathing glow behind the title.
          Zodicognac mode: amber slow-burn glow that pulses over 5 s.
          Both hidden when reduced-motion is active.
        */}
        {!znMode && !reduced && (
          <motion.div
            className="absolute inset-x-0 pointer-events-none"
            style={{
              top: "-60px",
              bottom: "-60px",
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(66,133,244,0.10) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {znMode && !reduced && (
          <motion.div
            className="absolute inset-x-0 pointer-events-none"
            style={{
              top: "-80px",
              bottom: "-80px",
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(251,191,36,0.14) 0%, rgba(217,119,6,0.08) 45%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0.7, 1] }}
            transition={{ duration: 5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "easeInOut" }}
          />
        )}

        {/* Brand insignia — 3-D flips to Zodicognac, then breathes */}
        <div className="flex justify-center mb-5 md:mb-8" style={{ perspective: "600px" }}>
          <AnimatePresence mode="wait">
            {znMode ? (
              <motion.div
                key="znmark"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_SPRING }}
              >
                {/* Inner wrapper pulses gently after the flip lands */}
                <motion.div
                  animate={reduced ? {} : { scale: [1, 1.07, 1, 1.05, 1] }}
                  transition={{ duration: 4, delay: 0.5, ease: "easeInOut" }}
                >
                  <ZodicognacMark size={56} active />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="zomark"
                initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE_SPRING }}
              >
                <ZodicogMark size={56} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main title ──────────────────────────────────────────────────────
            Normal mode: each character fades + slides up with 0.04 s stagger.
            Zodicognac mode: amber heading drifts in slowly.
            Reduced motion: plain static text.                              */}
        <AnimatePresence mode="wait">
          {znMode ? (
            <motion.h1
              key="zn-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE_SPRING }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-amber-400"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Zodicognac
            </motion.h1>
          ) : (
            <motion.h1
              key="zo-title"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -12 }}
              variants={
                reduced
                  ? undefined
                  : { visible: { transition: { staggerChildren: 0.04 } } }
              }
              className="text-5xl md:text-7xl font-extrabold tracking-tight select-none leading-tight"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {reduced
                ? "ZodicogAI"
                : TITLE_CHARS.map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      variants={charReveal}
                    >
                      {char}
                    </motion.span>
                  ))}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* ── Subtitle ────────────────────────────────────────────────────────
            Zodicognac mode: slow atmospheric flicker over 5 s.             */}
        <AnimatePresence mode="wait">
          {znMode ? (
            <motion.p
              key="zn-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.75, 0.5, 0.85, 0.6, 0.9] }}
              transition={{
                duration: 4.5,
                delay: 0.7,
                times: [0, 0.15, 0.35, 0.6, 0.8, 1],
                ease: "easeInOut",
              }}
              className="text-amber-500/70 mt-6 text-lg italic tracking-wide"
            >
              Entering private session…
            </motion.p>
          ) : (
            <motion.p
              key="zo-sub"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.55,
                delay: reduced ? 0 : 0.52,
                ease: EASE,
              }}
              className="text-zinc-400 mt-6 text-base md:text-lg"
            >
              Hybrid Behavioral Intelligence Agent
            </motion.p>
          )}
        </AnimatePresence>

        {/* Mobile-only CTA — navigate to dedicated pages, not inline forms */}
        {!znMode && (
          <div className="md:hidden mt-8 flex flex-col gap-3">
            <Link
              href="/analyze/zodiac"
              className="py-3.5 rounded-2xl text-sm font-semibold bg-[#4285f4] text-white text-center flex items-center justify-center gap-2 min-h-[48px] tap-highlight-none"
            >
              <span>✦</span> Self Analysis
            </Link>
            <Link
              href="/analyze/romantic"
              className="py-3.5 rounded-2xl text-sm font-semibold bg-white/[0.06] text-zinc-300 border border-white/[0.09] text-center flex items-center justify-center gap-2 min-h-[48px] tap-highlight-none"
            >
              <span>♥</span> Compatibility Analysis
            </Link>
            {/* Analysis type chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Zodiac", "MBTI", "Emotional", "Romantic", "Sextrology", "Love Style", "Love Language", "Numerology", "Aura Colors"].map((f) => (
                <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-zinc-600">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation + Forms — desktop only, dissolve on Zodicognac transition */}
      <AnimatePresence>
        {!znMode && (
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.5,
              delay: reduced ? 0 : 0.7,
              ease: EASE,
            }}
          >
            {/* Mode selector tabs — hidden on mobile, shown on desktop */}
            <div className="hidden md:flex justify-center mb-24">
              <div className="flex border-b border-white/[0.08]">
                {(["hybrid", "compatibility"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-6 pb-3 text-sm font-medium border-b-2 transition-all duration-200 capitalize ${
                      mode === m
                        ? "text-white border-[#4285f4]"
                        : "text-zinc-500 hover:text-zinc-200 border-transparent"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Form — swaps between Hybrid and Compatibility with slide */}
            <section className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE_SPRING }}
                >
                  {mode === "hybrid" && <HybridForm />}
                  {mode === "compatibility" && <CompatibilityForm />}
                </motion.div>
              </AnimatePresence>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zodicognac progress bar — thin amber line sweeping left→right ────
          Fills over exactly ZN_DURATION_MS seconds, then the router fires.
          Hidden for reduced-motion users.                                  */}
      {znMode && !reduced && (
        <motion.div
          className="fixed bottom-16 md:bottom-0 left-0 right-0 h-px"
          style={{
            transformOrigin: "left",
            background:
              "linear-gradient(to right, rgba(251,191,36,0.8) 0%, rgba(245,158,11,0.4) 60%, transparent 100%)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: ZN_DURATION_MS / 1000, ease: "linear" }}
        />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
