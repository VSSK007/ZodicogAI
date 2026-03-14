"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    <main className="min-h-screen px-5 md:px-8 py-10 md:py-32">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto text-center mb-10 md:mb-24 relative">

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
              className="text-7xl font-extrabold tracking-tight text-amber-400"
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

        {/* Mobile-only CTA buttons — visible only on mobile */}
        {!znMode && (
          <div className="flex flex-col gap-3 mt-8 md:hidden">
            <button
              onClick={() => setMode("hybrid")}
              className={`py-3.5 rounded-2xl text-sm font-semibold transition-all tap-highlight-none min-h-[48px] ${
                mode === "hybrid"
                  ? "bg-[#4285f4] text-white"
                  : "bg-white/[0.06] text-zinc-300 border border-white/[0.09] hover:bg-white/[0.09]"
              }`}
            >
              Self Analysis
            </button>
            <button
              onClick={() => setMode("compatibility")}
              className={`py-3.5 rounded-2xl text-sm font-semibold transition-all tap-highlight-none min-h-[48px] ${
                mode === "compatibility"
                  ? "bg-[#4285f4] text-white"
                  : "bg-white/[0.06] text-zinc-300 border border-white/[0.09] hover:bg-white/[0.09]"
              }`}
            >
              Compatibility Analysis
            </button>
          </div>
        )}
      </div>

      {/* ── Navigation + Forms — dissolve on Zodicognac transition ─────────── */}
      <AnimatePresence>
        {!znMode && (
          <motion.div
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
          className="fixed bottom-0 left-0 right-0 h-px"
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
