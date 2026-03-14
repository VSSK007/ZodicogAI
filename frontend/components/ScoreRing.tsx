"use client";

import { motion } from "framer-motion";

interface Props {
  score: number;
  size?: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  size = 160,
  label,
  color = "#6366f1",
  strokeWidth = 12,
}: Props) {
  const center = size / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="drop-shadow-xl">
        {/* Track */}
        <circle
          cx={center} cy={center} r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <motion.circle
          cx={center} cy={center} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Score label */}
        <text
          x={center} y={center - 4}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.18}
          fontWeight="800"
          fontFamily="var(--font-manrope), inherit"
        >
          {clamped.toFixed(1)}
        </text>
        <text
          x={center} y={center + size * 0.13}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize={size * 0.09}
          fontFamily="var(--font-manrope), inherit"
        >
          / 100
        </text>
      </svg>
      {label && (
        <p className="text-sm text-zinc-400 text-center font-medium">{label}</p>
      )}
    </div>
  );
}
