"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Espresso (Sabrina Carpenter) ─────────────────────────────────────────── */

const BEAN_FLOATERS = [
  { left: "6%",  delay: 0,    dur: 3.2 },
  { left: "18%", delay: 0.7,  dur: 2.8 },
  { left: "32%", delay: 1.3,  dur: 3.6 },
  { left: "48%", delay: 0.4,  dur: 3.0 },
  { left: "63%", delay: 1.0,  dur: 2.7 },
  { left: "77%", delay: 0.2,  dur: 3.4 },
  { left: "90%", delay: 1.6,  dur: 3.1 },
  { left: "38%", delay: 0.9,  dur: 2.9 },
  { left: "55%", delay: 1.8,  dur: 3.5 },
  { left: "82%", delay: 0.5,  dur: 2.6 },
];

const STEAM_PATHS = [
  "M 118 165 C 108 145, 128 125, 118 105",
  "M 140 160 C 150 140, 130 120, 140 100",
  "M 162 165 C 172 145, 152 125, 162 105",
  "M 96  168 C 86  148, 106 128, 96  108",
  "M 184 168 C 194 148, 174 128, 184 108",
];

function EspressoScene() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">

      {/* Coffee cups flying upward */}
      {BEAN_FLOATERS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: b.left, fontSize: 28 + (i % 3) * 8 }}
          initial={{ bottom: "-8%", opacity: 0 }}
          animate={{ bottom: "110%", opacity: [0, 1, 1, 0], rotate: [0, 20, -20, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
        >
          ☕
        </motion.div>
      ))}

      {/* Corner sparkles */}
      {([ ["4%","6%"], ["88%","5%"], ["3%","80%"], ["89%","82%"], ["46%","3%"] ] as const).map(([l, t], i) => (
        <motion.div
          key={i}
          className="absolute text-amber-300 pointer-events-none"
          style={{ left: l, top: t, fontSize: 20 + (i % 2) * 12 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.8, 0.4], rotate: [0, 90] }}
          transition={{ duration: 1.8, delay: i * 0.38, repeat: Infinity, repeatDelay: 0.9 }}
        >
          ✦
        </motion.div>
      ))}

      {/* Central panel */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-4">

        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-amber-200/70 text-[11px] font-semibold tracking-[0.5em] uppercase"
        >
          Sabrina Carpenter
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="text-center leading-none"
        >
          <p
            className="text-[4rem] sm:text-[6rem] font-black tracking-tighter text-amber-300"
            style={{
              textShadow:
                "0 0 30px #f59e0b, 0 0 60px #d97706, 0 0 100px #b45309, 0 0 160px #92400e",
            }}
          >
            ESPRESSO
          </p>
          <motion.p
            className="text-5xl mt-2"
            animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, delay: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          >
            ☕
          </motion.p>
        </motion.div>

        {/* Cup SVG */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
        >
          <svg width="280" height="200" viewBox="0 0 280 200">
            {/* Saucer shadow */}
            <ellipse cx="140" cy="188" rx="85" ry="12" fill="#000" opacity="0.4" />
            <ellipse cx="140" cy="184" rx="78" ry="10" fill="#78350f" opacity="0.55" />
            {/* Cup body */}
            <path d="M68 112 L77 168 L203 168 L212 112 Z"
              fill="#150600" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Inner highlight */}
            <path d="M70 118 L210 118" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
            {/* Handle */}
            <path d="M203 128 Q242 138 242 152 Q242 168 203 160"
              fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            {/* Coffee pool */}
            <ellipse cx="140" cy="114" rx="70" ry="11" fill="#3b1200" />
            <ellipse cx="140" cy="114" rx="55" ry="8"  fill="#b45309" opacity="0.55" />
            <ellipse cx="140" cy="114" rx="32" ry="5"  fill="#d97706" opacity="0.35" />
            {/* Cup rim */}
            <ellipse cx="140" cy="112" rx="71" ry="12" fill="none" stroke="#f59e0b" strokeWidth="3" />
            {/* Steam */}
            {STEAM_PATHS.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1], opacity: [0, 1, 0], y: [0, -28] }}
                transition={{
                  duration: 2.0,
                  delay: i * 0.38,
                  repeat: Infinity,
                  repeatDelay: 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-6 text-amber-400/70 text-[10px] tracking-[0.4em] uppercase"
      >
        tap anywhere to close
      </motion.p>
    </div>
  );
}

/* ─── Levitating (Dua Lipa) ────────────────────────────────────────────────── */

const STAR_FLOATERS = [
  { left: "5%",  delay: 0,    dur: 3.4, char: "✦", color: "#f0abfc", size: 30 },
  { left: "16%", delay: 0.5,  dur: 2.9, char: "✷", color: "#38bdf8", size: 22 },
  { left: "29%", delay: 1.1,  dur: 3.7, char: "✦", color: "#c084fc", size: 18 },
  { left: "45%", delay: 0.3,  dur: 3.1, char: "✸", color: "#e879f9", size: 26 },
  { left: "61%", delay: 0.8,  dur: 2.7, char: "✦", color: "#67e8f9", size: 34 },
  { left: "74%", delay: 1.4,  dur: 3.5, char: "✷", color: "#a855f7", size: 20 },
  { left: "87%", delay: 0.6,  dur: 3.0, char: "✦", color: "#f0abfc", size: 28 },
  { left: "38%", delay: 1.7,  dur: 2.8, char: "✸", color: "#38bdf8", size: 16 },
  { left: "53%", delay: 0.9,  dur: 3.3, char: "✦", color: "#e879f9", size: 24 },
  { left: "93%", delay: 1.9,  dur: 3.2, char: "✷", color: "#c084fc", size: 32 },
  { left: "2%",  delay: 1.3,  dur: 2.6, char: "✦", color: "#67e8f9", size: 26 },
];

function LevitatingScene() {
  const ORBS = [100, 80, 60, 42, 28, 14] as const;
  const ORB_FILLS = ["none","none","none","#4c1d95","#7e22ce","#e9d5ff"] as const;
  const ORB_STROKES = ["#3b0764","#581c87","#7e22ce","none","none","none"] as const;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">

      {/* Stars rising from bottom */}
      {STAR_FLOATERS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none font-bold"
          style={{ left: s.left, color: s.color, fontSize: s.size }}
          initial={{ bottom: "-6%", opacity: 0 }}
          animate={{ bottom: "112%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeOut" }}
        >
          {s.char}
        </motion.div>
      ))}

      {/* Corner bursts */}
      {([
        ["4%","6%","#f0abfc"], ["88%","5%","#38bdf8"],
        ["3%","82%","#e879f9"], ["89%","83%","#c084fc"],
        ["46%","2%","#f0abfc"],
      ] as const).map(([l, t, c], i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none font-bold"
          style={{ left: l, top: t, color: c, fontSize: 22 + (i % 2) * 14 }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 2.2, 0.3], rotate: [0, 180] }}
          transition={{ duration: 2.0, delay: i * 0.4, repeat: Infinity, repeatDelay: 0.5 }}
        >
          ✦
        </motion.div>
      ))}

      {/* Central panel */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-4">

        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-purple-200/70 text-[11px] font-semibold tracking-[0.5em] uppercase"
        >
          Dua Lipa
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="text-center leading-none"
        >
          <motion.p
            className="text-[4rem] sm:text-[6rem] font-black tracking-tighter text-purple-300"
            style={{
              textShadow:
                "0 0 30px #a855f7, 0 0 60px #7c3aed, 0 0 100px #4c1d95, 0 0 160px #2e1065",
            }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            LEVITATING
          </motion.p>
          <motion.p
            className="text-5xl mt-2"
            animate={{ y: [0, -14, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            ✦
          </motion.p>
        </motion.div>

        {/* Orb SVG */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
        >
          <svg width="280" height="200" viewBox="0 0 280 200">
            {/* Rings */}
            {ORBS.map((r, i) => (
              <motion.circle
                key={i}
                cx="140" cy="110"
                r={r}
                fill={ORB_FILLS[i]}
                stroke={ORB_STROKES[i]}
                strokeWidth={i < 3 ? 1.5 : 0}
                animate={{
                  y: [0, -14, 0],
                  opacity: i < 3 ? [0.35, 0.7, 0.35] : [0.9, 1, 0.9],
                  scale: i < 3 ? [0.95, 1.06, 0.95] : [1, 1.06, 1],
                }}
                style={{ transformOrigin: "140px 110px" }}
                transition={{
                  duration: 2.8,
                  delay: i * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Orbiting sparkles */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 140 + Math.cos(rad) * 72;
              const y = 110 + Math.sin(rad) * 72;
              return (
                <motion.text
                  key={i}
                  x={x} y={y}
                  fontSize="15"
                  fill={i % 2 === 0 ? "#f0abfc" : "#67e8f9"}
                  textAnchor="middle"
                  animate={{
                    opacity: [0, 1, 0],
                    y: [y, y - 14, y],
                    scale: [0.4, 1.4, 0.4],
                  }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                  transition={{ duration: 1.9, delay: i * 0.24, repeat: Infinity }}
                >
                  {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✷" : "✸"}
                </motion.text>
              );
            })}
          </svg>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-6 text-purple-300/70 text-[10px] tracking-[0.4em] uppercase"
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
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Easter egg"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 w-10 h-10 rounded-full border border-white/15 bg-white/8 flex items-center justify-center text-lg shadow-lg"
        initial={{ opacity: 0.25 }}
        whileHover={{ opacity: 1, scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.18 }}
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
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] cursor-pointer overflow-hidden"
            style={{
              background: isSabrina
                ? "radial-gradient(ellipse at 50% 60%, #92400e 0%, #451a03 35%, #1c0800 65%, #000 100%)"
                : "radial-gradient(ellipse at 50% 55%, #4c1d95 0%, #2e0b5e 35%, #0d0129 65%, #000 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="w-full h-full"
            >
              {isSabrina ? <EspressoScene /> : <LevitatingScene />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
