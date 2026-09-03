"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
}

const RING_DURATION = 1.4;

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
  const clamped = Math.min(Math.max(Number(score) || 0, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  // Count the number up in sync with the ring sweep, rather than snapping
  // straight to the final value.
  const [displayed, setDisplayed] = useState(0);
  const count = useMotionValue(0);

  useEffect(() => {
    setDisplayed(0);
    count.set(0);
    const controls = animate(count, clamped, {
      duration: RING_DURATION,
      ease: "easeOut",
      onUpdate: (v) => setDisplayed(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-xl w-full max-w-[180px] md:w-auto md:max-w-none">
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
          transition={{ duration: RING_DURATION, ease: "easeOut" }}
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
          {displayed.toFixed(1)}
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
