"use client";

/**
 * StreamPending — minimal wait state for SSE pages, shown between submitting
 * and the first streamed chunk. Visually continuous with ConstellationStream
 * (which takes over), unlike the old full result-skeleton that flashed a
 * score ring and vanished.
 */
import { motion } from "framer-motion";
import { Star4 } from "@/components/ui/glyphs";

export default function StreamPending({ label = "Consulting the stars…" }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-card border border-hairline bg-white/[0.02] px-5 py-6 flex items-center gap-3.5"
    >
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-gold shrink-0"
      >
        <Star4 size={14} />
      </motion.span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-secondary">{label}</p>
        <div className="mt-2.5 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            className="h-full w-1/3 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-accent), var(--color-gold-bright), transparent)" }}
            animate={{ x: ["-100%", "320%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
