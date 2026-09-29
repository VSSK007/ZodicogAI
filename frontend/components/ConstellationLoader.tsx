"use client";

/**
 * ConstellationLoader — the branded "AI is generating" moment for JSON
 * analyze pages. A small asterism draws itself line by line, holds, fades,
 * and redraws while a status line cycles underneath. Sits above the
 * skeleton so the slowest part of the product feels deliberate, not stuck.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const POINTS = [
  { x: 14, y: 70 },
  { x: 48, y: 42 },
  { x: 82, y: 58 },
  { x: 118, y: 24 },
  { x: 150, y: 46 },
  { x: 176, y: 14 },
];
const LINES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 3]];

const MESSAGES = [
  "Aligning the engines…",
  "Reading the stars…",
  "Weighing every framework…",
  "Writing your reading…",
];

const STEP = 0.45;
const CYCLE = LINES.length * STEP + 1.6;

export default function ConstellationLoader() {
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-card border border-hairline-gold bg-gold/[0.03] px-5 py-6 flex flex-col items-center gap-3"
    >
      <svg width="190" height="84" viewBox="0 0 190 84" fill="none" aria-hidden="true">
        {LINES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={POINTS[a].x} y1={POINTS[a].y}
            x2={POINTS[b].x} y2={POINTS[b].y}
            stroke="var(--color-gold-bright)"
            strokeWidth="0.9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.75, 0.75, 0] }}
            transition={{
              duration: CYCLE,
              delay: i * STEP,
              times: [0, 0.12, 0.85, 1],
              repeat: Infinity,
              repeatDelay: 0,
              ease: "easeOut",
            }}
          />
        ))}
        {POINTS.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r="2.4"
            fill="var(--color-gold-bright)"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.5, 1] }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            transition={{ duration: 2.2, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
      <p key={msg} className="text-shimmer text-micro font-semibold uppercase tracking-[0.16em]">
        {MESSAGES[msg]}
      </p>
    </div>
  );
}
