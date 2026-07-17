"use client";

/**
 * DualBar — two-person score distribution row (CSS/Framer bars, no Recharts).
 * Extracted from the previously-duplicated copies in analyze/love-style and
 * analyze/love-language. Person A = violet, Person B = gold.
 */
import { motion } from "framer-motion";

export function DualBar({
  label,
  aVal,
  bVal,
  i,
  aColor = "var(--color-accent-bright)",
  bColor = "var(--color-gold-bright)",
}: {
  label: string;
  aVal: number;
  bVal: number;
  i: number;
  aColor?: string;
  bColor?: string;
}) {
  return (
    <motion.div
      className="py-2.5 border-b border-white/[0.04] last:border-0 rounded-control px-2 -mx-2"
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-muted font-mono tabular-nums">
          {aVal.toFixed(0)} / {bVal.toFixed(0)}
        </span>
      </div>
      <div className="space-y-1">
        <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: aColor }}
            initial={{ width: 0 }}
            animate={{ width: `${aVal}%` }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
          />
        </div>
        <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: bColor }}
            initial={{ width: 0 }}
            animate={{ width: `${bVal}%` }}
            transition={{ duration: 0.7, delay: i * 0.06 + 0.05, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
