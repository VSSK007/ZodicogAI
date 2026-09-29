/**
 * Next.js instrumentation hook: server-side error reporting to Sentry.
 * Inert unless SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) is set, and only ever
 * loaded on the server, so it costs the client bundle nothing.
 */
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn,
    environment: process.env.APP_ENV ?? "production",
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
  });
}

export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
