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

const TITLE_CHARS = "ZodicogAI".split("");
const ZN_DURATION_MS = 2000;

const MORE_OPTIONS = [
  { label: "Zodiac",        href: "/analyze/zodiac",                   sym: "♈" },
  { label: "Emotional",     href: "/analyze/emotional",                sym: "◈" },
  { label: "Romantic",      href: "/analyze/romantic",                 sym: "♥" },
  { label: "Love Style",    href: "/analyze/love-style",               sym: "✦" },
  { label: "Love Lang",     href: "/analyze/love-language",            sym: "❝" },
  { label: "Sextrology",    href: "/analyze/sextrology",               sym: "◉" },
  { label: "Aura Colors",   href: "/analyze/color",                    sym: "○" },
  { label: "Numerology",    href: "/analyze/numerology",               sym: "∞" },
  { label: "Full Intel",    href: "/dashboard",                        sym: "⚡" },
  { label: "Blog",          href: "/blog",                             sym: "✍" },
  { label: "About",         href: "/about",                            sym: "◆" },
];

function HomeContent() {
  const [mode, setMode] = useState<"hybrid" | "compatibility">("hybrid");
  const [znMode, setZnMode] = useState(false);
  const [showMore, setShowMore] = useState(false);
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

  useEffect(() => {
    if (showMore) {
      document.body.classList.add("explore-open");
    } else {
      document.body.classList.remove("explore-open");
    }
    return () => document.body.classList.remove("explore-open");
  }, [showMore]);

  return (
    <main>

      {/* ══════════════════════════════════════════════════════════
          MOBILE HERO — normal state (never touches znMode)
      ══════════════════════════════════════════════════════════ */}
      <div className="md:hidden min-h-[calc(100dvh-64px)] flex flex-col relative">

        {/* Ambient amber glow */}
        {!reduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 90% 60% at 50% 38%, rgba(251,191,36,0.09) 0%, rgba(217,119,6,0.05) 55%, transparent 75%)" }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Top bar — email + github */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
          <a href="mailto:kar1mr@zodicogai.com" title="kar1mr@zodicogai.com" className="text-amber-900/50 hover:text-amber-700/70 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
          <span className="text-amber-900/25 text-[10px]">·</span>
          <a href="https://github.com/VSSK007/ZodicogAI" target="_blank" rel="noopener noreferrer" title="VSSK007/ZodicogAI" className="text-amber-900/50 hover:text-amber-700/70 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>

        {/* 22vh spacer — pins content position */}
        <div className="h-[22vh] shrink-0" />

        <div className="flex flex-col items-center text-center px-6">
          {/* ZodicogAI mark */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE_SPRING }}
            >
              <ZodicogMark size={56} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={reduced ? undefined : { visible: { transition: { staggerChildren: 0.04 } } }}
            className="text-5xl font-extrabold tracking-tight select-none leading-tight text-amber-50"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {reduced ? "ZodicogAI" : TITLE_CHARS.map((char, i) => (
              <motion.span key={i} className="inline-block" variants={charReveal}>{char}</motion.span>
            ))}
          </motion.h1>

          {/* Subtitle — static, never shifts */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduced ? 0 : 0.52, ease: EASE }}
            className="text-amber-200/35 mt-3 text-sm tracking-wide"
          >
            Behavioral Intelligence Agent
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="mt-10 w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
          >
            <Link href="/analyze/hybrid" className="w-full py-4 rounded-2xl text-sm font-semibold bg-amber-500 text-black text-center flex items-center justify-center gap-2 min-h-[52px] tap-highlight-none active:scale-[0.98] transition-transform">
              <span>✦</span> Self Analysis
            </Link>
            <Link href="/analyze/romantic" className="w-full py-4 rounded-2xl text-sm font-semibold bg-amber-500/[0.12] text-amber-200 border border-amber-500/25 text-center flex items-center justify-center gap-2 min-h-[52px] tap-highlight-none active:scale-[0.98] transition-transform">
              <span>♥</span> Compatibility
            </Link>
            <button
              onClick={() => setShowMore((v) => !v)}
              className="w-full py-4 rounded-2xl text-sm font-medium bg-white/[0.03] text-amber-200/45 border border-white/[0.06] flex items-center justify-center gap-2 min-h-[52px] tap-highlight-none active:scale-[0.98] transition-transform"
            >
              <motion.span animate={{ rotate: showMore ? 45 : 0 }} transition={{ duration: 0.22, ease: EASE }} className="text-xl leading-none">+</motion.span>
              {showMore ? "Close" : "Explore All"}
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 pt-1 pb-2">
                    {MORE_OPTIONS.map((opt) => (
                      <Link key={opt.href} href={opt.href} className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl bg-amber-500/[0.07] border border-amber-500/[0.14] tap-highlight-none active:scale-[0.96] transition-transform">
                        <span className="text-base text-amber-400/70">{opt.sym}</span>
                        <span className="text-[11px] text-amber-200/55 text-center leading-tight">{opt.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE ZODICOGNAC OVERLAY — fixed layer, zero layout impact
          Appears over the normal hero, positioned identically (22vh)
          so the mark lands at the exact same spot on screen.
      ══════════════════════════════════════════════════════════ */}
      {znMode && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#060504] flex flex-col">
          {/* Amber burn glow */}
          {!reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 90% 60% at 50% 38%, rgba(251,191,36,0.22) 0%, rgba(217,119,6,0.12) 45%, transparent 70%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1, 0.7, 1] }}
              transition={{ duration: 5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            />
          )}

          {/* Same 22vh spacer — mark lands at identical screen position */}
          <div className="h-[22vh] shrink-0" />

          <div className="flex flex-col items-center text-center px-6">
            {/* ZodicognacMark — flips in from where ZodicogMark was */}
            <div className="flex justify-center mb-4" style={{ perspective: "600px" }}>
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_SPRING }}
              >
                <motion.div
                  animate={reduced ? {} : { scale: [1, 1.07, 1, 1.05, 1] }}
                  transition={{ duration: 4, delay: 0.5, ease: "easeInOut" }}
                >
                  <ZodicognacMark size={56} active />
                </motion.div>
              </motion.div>
            </div>

            {/* Zodicognac title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE_SPRING }}
              className="text-5xl font-extrabold tracking-tight text-amber-400"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Zodicognac
            </motion.h1>

          </div>

          {/* Progress bar — above mobile nav */}
          {!reduced && (
            <motion.div
              className="absolute bottom-16 left-0 right-0 h-px"
              style={{ transformOrigin: "left", background: "linear-gradient(to right, rgba(251,191,36,0.8) 0%, rgba(245,158,11,0.4) 60%, transparent 100%)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: ZN_DURATION_MS / 1000, ease: "linear" }}
            />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DESKTOP HERO — analytical intelligence platform aesthetic
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block px-8 py-32">
        <div className="max-w-4xl mx-auto text-center mb-24 relative">

          {/* Background glow */}
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

          {/* Brand mark — fixed height prevents subtitle jump on mark unmount */}
          <div className="flex justify-center mb-8 h-14" style={{ perspective: "600px" }}>
            <AnimatePresence mode="wait">
              {znMode ? (
                <motion.div
                  key="desk-znmark"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: EASE_SPRING }}
                >
                  <motion.div
                    animate={reduced ? {} : { scale: [1, 1.07, 1, 1.05, 1] }}
                    transition={{ duration: 4, delay: 0.5, ease: "easeInOut" }}
                  >
                    <ZodicognacMark size={56} active />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="desk-zomark"
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

          {/* Title — min-h prevents subtitle shift when title unmounts */}
          <div className="min-h-[5.5rem] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {znMode ? (
                <motion.h1
                  key="desk-zn-title"
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
                  key="desk-zo-title"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  variants={reduced ? undefined : { visible: { transition: { staggerChildren: 0.04 } } }}
                  className="text-7xl font-extrabold tracking-tight select-none leading-tight"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {reduced
                    ? "ZodicogAI"
                    : TITLE_CHARS.map((char, i) => (
                        <motion.span key={i} className="inline-block" variants={charReveal}>
                          {char}
                        </motion.span>
                      ))}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Desktop forms */}
        <AnimatePresence>
          {!znMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, delay: 0, ease: EASE }}
            >
              <div className="flex justify-center mb-24">
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
      </div>

      {/* Zodicognac progress bar — desktop only (mobile has its own inside overlay) */}
      {znMode && !reduced && (
        <motion.div
          className="hidden md:block fixed bottom-0 left-0 right-0 h-px"
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
