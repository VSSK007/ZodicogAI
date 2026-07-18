"use client";

/**
 * AnalyzePageShell — the shared template for every /analyze page.
 *
 * Owns: page header (Eyebrow + title + description), the form ↔ result swap,
 * skeleton loading, and the error notice with retry. Pages keep their own
 * state, fetch logic, and result markup (results genuinely differ per type).
 *
 * The result slot is treated as opaque so SSE streaming pages
 * (ConstellationStream) work unchanged inside it.
 */
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import AnalyzeSkeleton from "@/components/AnalyzeSkeleton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { EASE } from "@/lib/motion";
import type { ReactNode } from "react";

export default function AnalyzePageShell({
  eyebrow,
  title,
  description,
  form,
  result,
  hasResult,
  loading = false,
  skeletonVariant = "solo",
  hideSkeleton = false,
  error,
  onRetry,
  onReset,
  resetLabel = "Try another reading",
  headerExtra,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** The input form block — hidden once hasResult is true. */
  form: ReactNode;
  /** The result block — rendered when hasResult is true. Opaque to the shell. */
  result: ReactNode;
  hasResult: boolean;
  loading?: boolean;
  skeletonVariant?: "solo" | "pair";
  /** Streaming pages hide the skeleton once their own stream UI takes over. */
  hideSkeleton?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Clears the result and re-shows the form. */
  onReset?: () => void;
  resetLabel?: string;
  /** Optional extra header content (e.g. mode toggles). */
  headerExtra?: ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 md:mb-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-[40px] leading-[1.08] text-ink text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-ink-secondary max-w-xl leading-relaxed">{description}</p>
        )}
        {headerExtra}
      </header>

      {/* Form */}
      <AnimatePresence>
        {!hasResult && (
          <motion.div
            key="form"
            initial={false}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.25 } }}
          >
            {form}
            {error && (
              <ErrorNotice message={error} onRetry={onRetry} className="mt-4" />
            )}
            {loading && !hideSkeleton && (
              <div className="mt-8">
                <AnalyzeSkeleton variant={skeletonVariant} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {result}
            {onReset && (
              <button
                onClick={onReset}
                className="mt-8 inline-flex items-center gap-1.5 rounded-control border border-hairline px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                {resetLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
