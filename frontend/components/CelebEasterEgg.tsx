"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Espresso scene (Sabrina Carpenter) ───────────────────────────────────── */

const STEAM = [
  "M 103 118 C 98 105, 108 95, 103 80",
  "M 116 115 C 121 102, 111 92, 116 77",
  "M 129 118 C 134 105, 124 95, 129 80",
];

function EspressoScene() {
  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <p className="text-amber-300/60 text-[9px] tracking-[0.45em] uppercase mb-1.5">
          Sabrina Carpenter
        </p>
        <p className="text-amber-300 text-2xl font-bold tracking-[0.25em]">
          ☕&nbsp; ESPRESSO
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-3xl scale-125" />
        <svg width="220" height="220" viewBox="0 0 220 220" className="relative">

          {/* Orbiting beans */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = 85;
            const cx = 110 + Math.cos(rad) * r;
            const cy = 125 + Math.sin(rad) * r * 0.45;
            return (
              <motion.ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="7"
                ry="5"
                fill="#92400e"
                opacity={0.55}
                animate={{ rotate: 360 }}
                style={{ transformOrigin: "110px 125px" }}
                transition={{ duration: 8 + i * 0.6, repeat: Infinity, ease: "linear" }}
              />
            );
          })}

          {/* Cup saucer */}
          <motion.g
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: "110px 148px" }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
          >
            <ellipse cx="110" cy="178" rx="50" ry="9" fill="#78350f" opacity="0.45" />
            <ellipse cx="110" cy="175" rx="44" ry="7" fill="#92400e" opacity="0.35" />
            {/* Cup body */}
            <path d="M80 132 L84 168 L136 168 L140 132 Z"
              fill="#150600" stroke="#b45309" strokeWidth="1.5" />
            {/* Handle */}
            <path d="M136 142 Q158 148 158 158 Q158 168 136 162"
              fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
            {/* Coffee pool */}
            <ellipse cx="110" cy="134" rx="28" ry="5" fill="#3b1200" />
            <ellipse cx="110" cy="134" rx="20" ry="3.5" fill="#b45309" opacity="0.35" />
            {/* Rim */}
            <ellipse cx="110" cy="132" rx="29" ry="6" fill="none" stroke="#b45309" strokeWidth="1.5" />
          </motion.g>

          {/* Steam */}
          {STEAM.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.85, 0], y: [0, -20] }}
              transition={{
                duration: 1.9,
                delay: i * 0.55,
                repeat: Infinity,
                repeatDelay: 0.3,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Sparkle stars */}
          {[[22, 42], [190, 60], [15, 155], [200, 40], [55, 22], [175, 180]].map(([x, y], i) => (
            <motion.text
              key={i}
              x={x} y={y}
              fontSize="13"
              fill="#fbbf24"
              textAnchor="middle"
              animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 0.4] }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              transition={{
                duration: 1.6,
                delay: i * 0.28,
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
            >
              ✦
            </motion.text>
          ))}
        </svg>
      </div>

      <motion.p
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-amber-500/50 text-[9px] tracking-[0.35em] uppercase"
      >
        tap anywhere to close
      </motion.p>
    </div>
  );
}

/* ─── Levitating scene (Dua Lipa) ──────────────────────────────────────────── */

const STAR_POSITIONS = [
  [18, 165], [42, 145], [68, 158], [92, 140], [120, 155], [148, 142],
  [172, 160], [196, 148], [30, 185], [80, 175], [140, 182], [185, 170],
] as const;

function LevitatingScene() {
  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <p className="text-purple-300/60 text-[9px] tracking-[0.45em] uppercase mb-1.5">
          Dua Lipa
        </p>
        <motion.p
          className="text-purple-300 text-2xl font-bold tracking-[0.25em]"
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦&nbsp; LEVITATING
        </motion.p>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-3xl scale-125" />
        <svg width="220" height="220" viewBox="0 0 220 220" className="relative">

          {/* Floating stars (travel upward) */}
          {STAR_POSITIONS.map(([sx, sy], i) => (
            <motion.text
              key={i}
              x={sx} y={sy}
              fontSize={9 + (i % 3) * 4}
              fill={i % 2 === 0 ? "#c084fc" : "#38bdf8"}
              textAnchor="middle"
              animate={{ y: [sy, sy - 180], opacity: [0, 1, 0] }}
              transition={{
                duration: 3.2,
                delay: (i * 0.22) % 2.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              ✦
            </motion.text>
          ))}

          {/* Pulsing rings */}
          {[38, 58, 78].map((r, i) => (
            <motion.circle
              key={i}
              cx="110" cy="108"
              r={r}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1"
              animate={{ opacity: [0.5, 0.12, 0.5], scale: [0.92, 1.08, 0.92] }}
              style={{ transformOrigin: "110px 108px" }}
              transition={{ duration: 2.8, delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Central orb layers */}
          <motion.circle cx="110" cy="108" r="22" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="110" cy="108" r="14" fill="#7e22ce" opacity="0.9"
            animate={{ y: [0, -9, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="110" cy="108" r="7" fill="#e9d5ff"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Glint sparkles around orb */}
          {[[60, 68], [155, 72], [45, 120], [168, 125], [85, 48], [138, 52]].map(([x, y], i) => (
            <motion.text
              key={i}
              x={x} y={y}
              fontSize="11"
              fill={i % 2 === 0 ? "#f0abfc" : "#7dd3fc"}
              textAnchor="middle"
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 0.7 }}
            >
              ✷
            </motion.text>
          ))}
        </svg>
      </div>

      <motion.p
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-purple-400/50 text-[9px] tracking-[0.35em] uppercase"
      >
        tap anywhere to close
      </motion.p>
    </div>
  );
}

/* ─── Export ────────────────────────────────────────────────────────────────── */

export default function CelebEasterEgg({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  if (slug !== "sabrina-carpenter" && slug !== "dua-lipa") return null;

  const isSabrina = slug === "sabrina-carpenter";

  return (
    <>
      {/* Subtle floating trigger */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Easter egg"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-base"
        initial={{ opacity: 0.2 }}
        whileHover={{ opacity: 1, scale: 1.15 }}
        transition={{ duration: 0.2 }}
      >
        {isSabrina ? "☕" : "✨"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="egg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
            style={{
              background: isSabrina
                ? "radial-gradient(ellipse at center, #3b1a0588 0%, #0a040288 55%, #000000cc 100%)"
                : "radial-gradient(ellipse at center, #2e0a4e88 0%, #08031688 55%, #000000cc 100%)",
            }}
          >
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.65, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isSabrina ? <EspressoScene /> : <LevitatingScene />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
