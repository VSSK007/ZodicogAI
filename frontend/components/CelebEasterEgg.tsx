"use client";

/**
 * CelebEasterEgg — a hidden "concert visual" for two chart pages.
 *
 * Typography-first: a giant shimmering italic title over a generative canvas
 * particle field, themed per artist.
 *   · Dua Lipa — LEVITATING: anti-gravity neon particle field, violet/cyan,
 *     retro-future streaks drifting upward.
 *   · Sabrina Carpenter — ESPRESSO: rising golden steam wisps + twinkling
 *     sparkles over a warm café-noir ground.
 *
 * Click anywhere to dismiss; auto-closes after ~5.5s. Respects reduced motion.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const DURATION_MS = 5500;

interface EggTheme {
  artist: string;
  title: string;
  tagline: string;
  bg: string;
  /** Shimmer gradient for the title (background-clip: text). */
  titleGradient: string;
  glow: string;
  taglineColor: string;
  mode: "levitate" | "espresso";
  accents: string[];
}

const EGGS: Record<string, EggTheme> = {
  "dua-lipa": {
    artist: "Dua Lipa",
    title: "LEVITATING",
    tagline: "FUTURE NOSTALGIA",
    bg: "radial-gradient(ellipse 90% 70% at 50% 100%, #2a0a4a 0%, #14062a 45%, #06020e 100%)",
    titleGradient: "linear-gradient(110deg, #a78bfa 15%, #f0abfc 38%, #67e8f9 52%, #f0abfc 66%, #a78bfa 85%)",
    glow: "rgba(168, 85, 247, 0.55)",
    taglineColor: "#c4b5fd",
    mode: "levitate",
    accents: ["#a78bfa", "#f0abfc", "#67e8f9", "#e879f9", "#818cf8"],
  },
  "sabrina-carpenter": {
    artist: "Sabrina Carpenter",
    title: "ESPRESSO",
    tagline: "SHORT N' SWEET",
    bg: "radial-gradient(ellipse 90% 70% at 50% 100%, #3a2410 0%, #1e1006 45%, #0a0502 100%)",
    titleGradient: "linear-gradient(110deg, #d8a63c 15%, #f5e5c0 42%, #fff8e8 50%, #f5e5c0 58%, #d8a63c 85%)",
    glow: "rgba(216, 166, 60, 0.55)",
    taglineColor: "#edcb7e",
    mode: "espresso",
    accents: ["#edcb7e", "#d8a63c", "#f5e5c0"],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Generative particle canvas
───────────────────────────────────────────────────────────────────────────── */
function ParticleCanvas({ theme, still }: { theme: EggTheme; still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);

    let raf = 0;
    const start = performance.now();

    if (theme.mode === "levitate") {
      // Anti-gravity field: glowing dots + long vertical streaks, all rising.
      const dots = Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.8 + 0.6) * dpr,
        v: (Math.random() * 0.6 + 0.25) * dpr,
        sway: Math.random() * Math.PI * 2,
        swayAmp: (Math.random() * 14 + 4) * dpr,
        color: theme.accents[Math.floor(Math.random() * theme.accents.length)],
        a: Math.random() * 0.5 + 0.25,
      }));
      const streaks = Array.from({ length: 14 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        len: (Math.random() * 90 + 50) * dpr,
        v: (Math.random() * 2.4 + 1.6) * dpr,
        color: theme.accents[Math.floor(Math.random() * theme.accents.length)],
        a: Math.random() * 0.28 + 0.10,
      }));

      const draw = (t: number) => {
        ctx.clearRect(0, 0, W, H);
        const elapsed = (t - start) / 1000;

        for (const p of dots) {
          p.y -= p.v;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          const x = p.x + Math.sin(elapsed * 0.8 + p.sway) * p.swayAmp;
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10 * dpr;
          ctx.beginPath();
          ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        for (const s of streaks) {
          s.y -= s.v;
          if (s.y < -s.len) { s.y = H + s.len; s.x = Math.random() * W; }
          const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
          grad.addColorStop(0, s.color);
          grad.addColorStop(1, "transparent");
          ctx.globalAlpha = s.a;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y + s.len);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (!still) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    } else {
      // Espresso: soft steam wisps curling up from the lower half + sparkles.
      const wisps = Array.from({ length: 8 }, (_, i) => ({
        x: W * (0.28 + (i / 8) * 0.44 + (Math.random() - 0.5) * 0.06),
        y: H * (0.75 + Math.random() * 0.2),
        r: (Math.random() * 60 + 40) * dpr,
        v: (Math.random() * 0.5 + 0.3) * dpr,
        sway: Math.random() * Math.PI * 2,
        swayAmp: (Math.random() * 30 + 16) * dpr,
        a: Math.random() * 0.05 + 0.035,
      }));
      const sparkles = Array.from({ length: 34 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: (Math.random() * 2.2 + 1.2) * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.4 + 0.6,
        color: theme.accents[Math.floor(Math.random() * theme.accents.length)],
      }));

      const draw = (t: number) => {
        ctx.clearRect(0, 0, W, H);
        const elapsed = (t - start) / 1000;

        for (const w of wisps) {
          w.y -= w.v;
          if (w.y < -w.r) { w.y = H + w.r; }
          const x = w.x + Math.sin(elapsed * 0.6 + w.sway) * w.swayAmp;
          const grad = ctx.createRadialGradient(x, w.y, 0, x, w.y, w.r);
          grad.addColorStop(0, `rgba(245, 229, 192, ${w.a})`);
          grad.addColorStop(1, "rgba(245, 229, 192, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, w.y, w.r, 0, Math.PI * 2);
          ctx.fill();
        }

        for (const sp of sparkles) {
          const tw = 0.5 + 0.5 * Math.sin(elapsed * sp.speed * 2 + sp.phase);
          ctx.globalAlpha = tw * 0.75;
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(sp.x - sp.s, sp.y); ctx.lineTo(sp.x + sp.s, sp.y);
          ctx.moveTo(sp.x, sp.y - sp.s); ctx.lineTo(sp.x, sp.y + sp.s);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (!still) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(raf);
  }, [theme, still]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   The scene
───────────────────────────────────────────────────────────────────────────── */
function EggScene({ theme, onClose }: { theme: EggTheme; onClose: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      role="button"
      aria-label={`${theme.artist} easter egg — click to dismiss`}
      className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: theme.bg }}
    >
      <style>{`
        @keyframes egg-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <ParticleCanvas theme={theme} still={!!reduced} />

      {/* Center lockup */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center select-none">
        {/* Artist */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] tracking-[0.55em] uppercase font-semibold"
          style={{ color: `${theme.taglineColor}99`, fontFamily: "'Gilroy', sans-serif" }}
        >
          {theme.artist}
        </motion.p>

        {/* Title — giant, italic, shimmering */}
        <motion.h2
          initial={reduced ? false : { opacity: 0, letterSpacing: "0.55em", filter: "blur(10px)" }}
          animate={{ opacity: 1, letterSpacing: "0.14em", filter: "blur(0px)" }}
          transition={{ delay: 0.35, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[13vw] md:text-[7.5rem] leading-none whitespace-nowrap"
          style={{
            fontFamily: "'Gilroy', sans-serif",
            fontWeight: 800,
            fontStyle: "italic",
            backgroundImage: theme.titleGradient,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 0 28px ${theme.glow})`,
            animation: reduced ? undefined : "egg-shimmer 3.2s linear 0.9s infinite",
          }}
        >
          {theme.title}
        </motion.h2>

        {/* Tagline between hairlines */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.7 }}
          className="flex items-center gap-4"
        >
          <span className="h-px w-10 md:w-16" style={{ background: `linear-gradient(to left, ${theme.taglineColor}66, transparent)` }} />
          <span
            className="text-[10px] md:text-[11px] tracking-[0.45em] uppercase"
            style={{ color: theme.taglineColor, fontFamily: "'Gilroy', sans-serif", fontWeight: 300 }}
          >
            {theme.tagline}
          </span>
          <span className="h-px w-10 md:w-16" style={{ background: `linear-gradient(to right, ${theme.taglineColor}66, transparent)` }} />
        </motion.div>
      </div>

      {/* Progress hairline */}
      {!reduced && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            transformOrigin: "left",
            background: `linear-gradient(to right, ${theme.taglineColor}cc 0%, ${theme.taglineColor}55 60%, transparent 100%)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Export
───────────────────────────────────────────────────────────────────────────── */
export default function CelebEasterEgg({ slug }: { slug: string }) {
  const [open, setOpen] = useState(true);
  const theme = EGGS[slug];

  if (!theme) return null;

  return (
    <AnimatePresence>
      {open && <EggScene theme={theme} onClose={() => setOpen(false)} />}
    </AnimatePresence>
  );
}
