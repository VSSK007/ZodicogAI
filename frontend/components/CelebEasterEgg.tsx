"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   ESPRESSO — Sabrina Carpenter
   Style ref: Google zodiac Easter eggs — cute animated character, bouncy,
   personality-driven. A lil espresso cup with a face that dances.
───────────────────────────────────────────────────────────────────────────── */
function EspressoScene() {
  return (
    <div className="flex flex-col items-center gap-6 select-none">

      {/* Artist + song label */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] tracking-[0.45em] uppercase font-semibold"
          style={{ color: "#fbbf24cc" }}
        >
          Sabrina Carpenter
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
          className="text-3xl font-black tracking-widest mt-1"
          style={{
            color: "#fde68a",
            textShadow: "0 0 24px #f59e0b, 0 0 48px #d97706",
          }}
        >
          ☕ ESPRESSO
        </motion.p>
      </div>

      {/* Cup character */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
      >
        <svg width="200" height="240" viewBox="0 0 200 240">

          {/* Saucer */}
          <motion.ellipse
            cx="100" cy="210" rx="68" ry="12"
            fill="#92400e"
            animate={{ scaleX: [1, 1.06, 1], scaleY: [1, 0.94, 1] }}
            style={{ transformOrigin: "100px 210px" }}
            transition={{ duration: 0.55, delay: 0.9, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="100" cy="207" rx="60" ry="9"
            fill="#b45309" opacity="0.6"
            animate={{ scaleX: [1, 1.06, 1], scaleY: [1, 0.94, 1] }}
            style={{ transformOrigin: "100px 207px" }}
            transition={{ duration: 0.55, delay: 0.9, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
          />

          {/* Cup body — bounces on "land" */}
          <motion.g
            animate={{
              y: [0, -28, 0, -12, 0, -5, 0],
              scaleY: [1, 1.06, 0.88, 1.04, 0.96, 1.02, 1],
              scaleX: [1, 0.94, 1.08, 0.97, 1.02, 0.99, 1],
            }}
            style={{ transformOrigin: "100px 200px" }}
            transition={{
              duration: 1.4,
              delay: 0.8,
              repeat: Infinity,
              repeatDelay: 1.6,
              ease: "easeOut",
            }}
          >
            {/* Body */}
            <path d="M52 118 L58 188 L142 188 L148 118 Z"
              fill="#1c0800" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Handle */}
            <path d="M144 132 Q172 140 172 155 Q172 170 144 163"
              fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            {/* Coffee */}
            <ellipse cx="100" cy="120" rx="45" ry="8" fill="#3b1200" />
            <ellipse cx="100" cy="120" rx="34" ry="5.5" fill="#b45309" opacity="0.55" />
            {/* Rim */}
            <ellipse cx="100" cy="118" rx="46" ry="9" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

            {/* Face — eyes */}
            <motion.circle cx="86" cy="148" r="5" fill="#fbbf24"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 0.15, delay: 2.5, repeat: Infinity, repeatDelay: 3.2 }}
            />
            <motion.circle cx="114" cy="148" r="5" fill="#fbbf24"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 0.15, delay: 2.5, repeat: Infinity, repeatDelay: 3.2 }}
            />
            {/* Pupils */}
            <circle cx="88" cy="149" r="2.5" fill="#1c0800" />
            <circle cx="116" cy="149" r="2.5" fill="#1c0800" />

            {/* Smile */}
            <motion.path
              d="M88 165 Q100 175 112 165"
              fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"
              animate={{ d: ["M88 165 Q100 175 112 165", "M88 162 Q100 172 112 162", "M88 165 Q100 175 112 165"] }}
              transition={{ duration: 1.4, delay: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
            />

            {/* Rosy cheeks */}
            <circle cx="72" cy="158" r="8" fill="#f87171" opacity="0.35" />
            <circle cx="128" cy="158" r="8" fill="#f87171" opacity="0.35" />
          </motion.g>

          {/* Steam wisps */}
          {[
            "M 82 112 C 76 96, 88 82, 82 66",
            "M 100 108 C 106 92, 94 78, 100 62",
            "M 118 112 C 124 96, 112 82, 118 66",
          ].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.9, 0], y: [0, -18] }}
              transition={{
                duration: 1.8,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Floating sparkles around cup */}
          {[[28, 80], [168, 75], [18, 155], [178, 160], [96, 42], [154, 42]].map(([x, y], i) => (
            <motion.text
              key={i}
              x={x} y={y}
              fontSize={10 + (i % 3) * 4}
              fill="#fbbf24"
              textAnchor="middle"
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.5, 0.3] }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              transition={{
                duration: 1.4,
                delay: i * 0.32,
                repeat: Infinity,
                repeatDelay: 0.7,
              }}
            >
              ✦
            </motion.text>
          ))}
        </svg>
      </motion.div>

      {/* Tap hint */}
      <motion.p
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className="text-[9px] tracking-[0.4em] uppercase"
        style={{ color: "#fbbf2466" }}
      >
        tap to close
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEVITATING — Dua Lipa
   A glowing star character that floats and radiates — cute, magical, bouncy.
───────────────────────────────────────────────────────────────────────────── */
function LevitatingScene() {
  return (
    <div className="flex flex-col items-center gap-6 select-none">

      {/* Artist + song label */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] tracking-[0.45em] uppercase font-semibold"
          style={{ color: "#d8b4fecc" }}
        >
          Dua Lipa
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
          className="text-3xl font-black tracking-widest mt-1"
          style={{
            color: "#e9d5ff",
            textShadow: "0 0 24px #a855f7, 0 0 48px #7c3aed",
          }}
        >
          ✦ LEVITATING
        </motion.p>
      </div>

      {/* Star character */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
      >
        <svg width="220" height="240" viewBox="0 0 220 240">

          {/* Shadow on ground — shrinks as character floats up */}
          <motion.ellipse
            cx="110" cy="225" rx="40" ry="7"
            fill="#000" opacity="0.3"
            animate={{ rx: [40, 22, 40], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Outer glow rings */}
          {[72, 55, 40].map((r, i) => (
            <motion.circle
              key={i}
              cx="110" cy="118"
              r={r}
              fill="none"
              stroke={["#3b0764", "#6d28d9", "#a855f7"][i]}
              strokeWidth={[1, 1.5, 2][i]}
              animate={{ y: [0, -18, 0], opacity: [0.4, 0.7, 0.4], scale: [0.96, 1.05, 0.96] }}
              style={{ transformOrigin: "110px 118px" }}
              transition={{ duration: 2.6, delay: i * 0.28, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Body glow layers */}
          <motion.circle cx="110" cy="118" r="30"
            fill="#4c1d95"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="110" cy="118" r="22"
            fill="#7e22ce"
            animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
            style={{ transformOrigin: "110px 118px" }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="110" cy="118" r="13"
            fill="#a855f7"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="110" cy="118" r="6"
            fill="#f3e8ff"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Face — eyes */}
          <motion.circle cx="103" cy="113" r="4" fill="#e9d5ff"
            animate={{ y: [0, -18, 0], scaleY: [1, 0.1, 1] }}
            style={{ transformOrigin: "103px 113px" }}
            transition={{
              y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.12, delay: 3.1, repeat: Infinity, repeatDelay: 3.5 },
            }}
          />
          <motion.circle cx="117" cy="113" r="4" fill="#e9d5ff"
            animate={{ y: [0, -18, 0], scaleY: [1, 0.1, 1] }}
            style={{ transformOrigin: "117px 113px" }}
            transition={{
              y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.12, delay: 3.1, repeat: Infinity, repeatDelay: 3.5 },
            }}
          />
          {/* Pupils */}
          <motion.circle cx="104" cy="114" r="2" fill="#4c1d95"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="118" cy="114" r="2" fill="#4c1d95"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Smile */}
          <motion.path
            d="M103 126 Q110 132 117 126"
            fill="none" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Rosy cheeks */}
          <motion.circle cx="96" cy="121" r="6" fill="#f0abfc" opacity="0.4"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="124" cy="121" r="6" fill="#f0abfc" opacity="0.4"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Orbiting sparkle stars */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const ox = 110 + Math.cos(rad) * 62;
            const oy = 118 + Math.sin(rad) * 62;
            return (
              <motion.text
                key={i}
                x={ox} y={oy}
                fontSize={8 + (i % 2) * 5}
                fill={i % 2 === 0 ? "#f0abfc" : "#67e8f9"}
                textAnchor="middle"
                animate={{
                  rotate: 360,
                  opacity: [0.5, 1, 0.5],
                  y: [oy, oy - 18, oy],
                }}
                style={{ transformOrigin: "110px 118px" }}
                transition={{
                  rotate: { duration: 6 + i * 0.4, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 1.6, delay: i * 0.25, repeat: Infinity },
                  y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✷" : "✸"}
              </motion.text>
            );
          })}

          {/* Scattered sparkles in background */}
          {[[22, 50], [192, 55], [14, 170], [200, 165], [108, 30], [56, 195], [164, 200]].map(([x, y], i) => (
            <motion.text
              key={i}
              x={x} y={y}
              fontSize={8 + (i % 3) * 4}
              fill={i % 2 === 0 ? "#c084fc" : "#38bdf8"}
              textAnchor="middle"
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              transition={{
                duration: 1.5,
                delay: i * 0.28,
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
            >
              ✦
            </motion.text>
          ))}
        </svg>
      </motion.div>

      {/* Tap hint */}
      <motion.p
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className="text-[9px] tracking-[0.4em] uppercase"
        style={{ color: "#a855f766" }}
      >
        tap to close
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
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: isSabrina
                ? "radial-gradient(ellipse at 50% 55%, #3b1a05 0%, #1c0a00 50%, #000 100%)"
                : "radial-gradient(ellipse at 50% 50%, #2e0b5e 0%, #0d0129 50%, #000 100%)",
              backdropFilter: "blur(6px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.55, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {isSabrina ? <EspressoScene /> : <LevitatingScene />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
