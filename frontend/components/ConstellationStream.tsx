"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Static star positions for the card background ─────────────────────────────
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 137.508 + 7.3) * 6.1) % 100,
  y: ((i * 89.31  + 17.7) * 4.9) % 100,
  r: i % 5 === 0 ? 1.4 : i % 3 === 0 ? 1.0 : 0.6,
  delay: -(i % 7) * 1.1,
  dur: 2.5 + (i % 5) * 0.8,
}));

// ── Constellation SVG — draws lines between 5 star points ────────────────────
function ConstellationIndicator({ active }: { active: boolean }) {
  // Five points arranged like a loose asterism
  const pts = [
    { cx: 12, cy: 4  },
    { cx: 22, cy: 10 },
    { cx: 18, cy: 22 },
    { cx: 6,  cy: 22 },
    { cx: 2,  cy: 10 },
  ];
  const lines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2],
  ];

  return (
    <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
      {lines.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={pts[a].cx} y1={pts[a].cy}
          x2={pts[b].cx} y2={pts[b].cy}
          stroke={active ? "rgba(251,191,36,0.6)" : "rgba(251,191,36,0.2)"}
          strokeWidth="0.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: active ? 1 : 0.3, opacity: active ? 1 : 0.4 }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
        />
      ))}
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx} cy={p.cy} r="1.2"
          fill={active ? "#fbbf24" : "rgba(251,191,36,0.4)"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
        />
      ))}
    </svg>
  );
}

// ── Chunk — a single streamed text segment with glow reveal ───────────────────
function GlowChunk({ text, index }: { text: string; index: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, textShadow: "0 0 12px rgba(251,191,36,0.9)" }}
      animate={{
        opacity: 1,
        textShadow: [
          "0 0 12px rgba(251,191,36,0.9)",
          "0 0 6px rgba(251,191,36,0.4)",
          "0 0 0px rgba(251,191,36,0)",
        ],
      }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{ display: "inline" }}
    >
      {text}
    </motion.span>
  );
}

// ── Star cursor — trails the streaming text edge ──────────────────────────────
function StarCursor() {
  return (
    <motion.span
      animate={{
        opacity: [1, 0.2, 1],
        scale:   [1, 1.3, 1],
        textShadow: [
          "0 0 8px rgba(251,191,36,1)",
          "0 0 14px rgba(251,191,36,0.6)",
          "0 0 8px rgba(251,191,36,1)",
        ],
      }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block", color: "#fbbf24", marginLeft: 2 }}
    >
      ✦
    </motion.span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ConstellationStreamProps {
  text:      string;       // full accumulated streamed text so far
  streaming: boolean;      // true while stream is in progress
  visible:   boolean;      // controls mount/unmount
}

export default function ConstellationStream({
  text,
  streaming,
  visible,
}: ConstellationStreamProps) {
  // Split text into chunks as they arrive so each gets its own glow animation
  const [chunks, setChunks] = useState<string[]>([]);
  const prevLen = useRef(0);

  useEffect(() => {
    if (text.length > prevLen.current) {
      const newPart = text.slice(prevLen.current);
      prevLen.current = text.length;
      // Split new text into word-sized chunks for smoother glow effect
      const words = newPart.match(/\S+\s*/g) || [newPart];
      setChunks(prev => [...prev, ...words]);
    }
  }, [text]);

  // Reset when text is cleared
  useEffect(() => {
    if (text === "") {
      setChunks([]);
      prevLen.current = 0;
    }
  }, [text]);

  // Illuminate stars progressively as more text arrives
  const progress = Math.min(text.length / 800, 1); // fully lit at 800 chars

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(6,6,21,0.97) 0%, rgba(12,8,28,0.97) 100%)",
            border: "1px solid rgba(251,191,36,0.18)",
            boxShadow: streaming
              ? "0 0 32px rgba(251,191,36,0.08), inset 0 0 40px rgba(251,191,36,0.03)"
              : "0 0 16px rgba(251,191,36,0.04)",
          }}
        >
          {/* ── Star field background ───────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {STARS.map((s, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [s.r * 0.3, s.r * 0.3 + progress * 0.5, s.r * 0.3] }}
                transition={{ duration: s.dur, delay: s.delay, repeat: Infinity }}
                style={{
                  position: "absolute",
                  left:   `${s.x}%`,
                  top:    `${s.y}%`,
                  width:  s.r * 2,
                  height: s.r * 2,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
            ))}
          </div>

          {/* ── Ambient glow that pulses while streaming ────────────── */}
          {streaming && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(251,191,36,0.15) 0%, transparent 70%)",
              }}
            />
          )}

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="relative flex items-center gap-3 px-5 pt-5 pb-3 border-b border-amber-500/10">
            <ConstellationIndicator active={streaming} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400/80">
                {streaming ? "Reading the stars…" : "Celestial Reading Complete"}
              </p>
              {!streaming && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-zinc-600 mt-0.5"
                >
                  ✦ Powered by ZodicogAI behavioral engines
                </motion.p>
              )}
            </div>
            {!streaming && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="ml-auto text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                ✦ Done
              </motion.span>
            )}
          </div>

          {/* ── Streamed text ────────────────────────────────────────── */}
          <div className="relative px-5 pt-4 pb-5">
            <p
              className="text-sm leading-relaxed text-zinc-200"
              style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
            >
              {chunks.map((chunk, i) => (
                <GlowChunk key={i} text={chunk} index={i} />
              ))}
              {streaming && <StarCursor />}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
