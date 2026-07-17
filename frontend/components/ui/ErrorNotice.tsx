"use client";

/**
 * ErrorNotice — the standard error surface with a retry affordance.
 * Replaces the bare red <p> pattern on analyze pages.
 */
import { AlertCircle, RotateCcw } from "lucide-react";

export function ErrorNotice({
  message,
  onRetry,
  className = "",
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-card border border-red-500/25 bg-red-500/[0.06] px-4 py-3.5 ${className}`}
    >
      <AlertCircle className="size-4.5 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink">{message}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          If this keeps happening, try again in a few minutes.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-ink-secondary hover:text-ink border border-hairline hover:border-hairline-strong rounded-control px-3 py-1.5 transition-colors tap-highlight-none"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
