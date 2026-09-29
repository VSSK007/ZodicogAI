"use client";

/**
 * Client error reporting. Sentry is imported lazily on the first error (or the
 * first explicit report), so it adds nothing to the initial bundle; a no-op
 * without NEXT_PUBLIC_SENTRY_DSN.
 */
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

type SentryModule = typeof import("@sentry/nextjs");
let loading: Promise<SentryModule> | null = null;

function sentry(): Promise<SentryModule> | null {
  if (!DSN) return null;
  loading ??= import("@sentry/nextjs").then((S) => {
    S.init({
      dsn: DSN,
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "production",
      tracesSampleRate: 0.05,
      sendDefaultPii: false,
    });
    return S;
  });
  return loading;
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  sentry()?.then((S) => S.captureException(error, context ? { extra: context } : undefined)).catch(() => {});
}

let installed = false;

/** Route uncaught errors and unhandled promise rejections to Sentry. */
export function installGlobalErrorHandlers() {
  if (installed || !DSN || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => reportError(e.error ?? e.message));
  window.addEventListener("unhandledrejection", (e) => reportError(e.reason));
}
