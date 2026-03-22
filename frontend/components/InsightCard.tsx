"use client";

import { motion } from "framer-motion";

interface InsightCardProps {
  hook: string;
  shareText?: string;
  name?: string;
  tags?: string[];
  /** 0–100 confidence or pattern score */
  score?: number;
  hookType?: string;
}

/**
 * Viral identity card — large hook text, tag pills, optional score ring, share button.
 * Used across all /discover pages as the hero element.
 */
export default function InsightCard({
  hook,
  shareText,
  name,
  tags = [],
  score,
  hookType,
}: InsightCardProps) {
  function handleShare() {
    const text = shareText ?? hook;
    const url  = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "ZodicogAI", text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`).then(() => {
        alert("Copied to clipboard!");
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5 md:p-6 space-y-4"
    >
      {/* Hook text — the viral hero */}
      <p className="text-xl md:text-2xl font-semibold text-white leading-snug tracking-tight">
        &ldquo;{hook}&rdquo;
      </p>

      {/* Score bar (optional) */}
      {score !== undefined && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              {hookType ? `${hookType} match` : "confidence"}
            </span>
            <span className="text-sm font-semibold text-amber-400">{Math.round(score)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Share CTA */}
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 text-sm text-amber-500/80 hover:text-amber-400 transition-colors tap-highlight-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share this
      </button>
    </motion.div>
  );
}
