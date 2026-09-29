"use client";

/**
 * Product analytics + feature flags (PostHog), loaded lazily and only when
 * NEXT_PUBLIC_POSTHOG_KEY is set. Cookieless (localStorage persistence), no
 * autocapture, no session recording, and Do-Not-Track is honoured.
 *
 * Flags arrive shortly after load, so use them on surfaces a visitor reaches
 * after interacting (forms, results) rather than on first paint, where a
 * variant would visibly swap in.
 */
import { useEffect, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHog = typeof import("posthog-js").default;
type Queued = { event: string; properties?: Record<string, unknown> };

const READY_EVENT = "posthog:ready";
let ready: Promise<PostHog> | null = null;
const queue: Queued[] = [];

function dnt(): boolean {
  return typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as { doNotTrack?: string }).doNotTrack === "1");
}

/** Load and initialise PostHog (idempotent), then flush anything captured earlier. */
export function startPostHog(): Promise<PostHog> | null {
  if (!KEY || typeof window === "undefined" || dnt()) return null;
  ready ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      persistence: "localStorage",
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });
    for (const q of queue.splice(0)) posthog.capture(q.event, q.properties);
    window.dispatchEvent(new Event(READY_EVENT));
    return posthog;
  });
  return ready;
}

/**
 * Record an event. Before PostHog has been started (it starts on first
 * interaction) events are buffered, so nothing is lost and nothing loads early.
 */
export function capture(event: string, properties?: Record<string, unknown>) {
  if (!KEY || dnt()) return;
  if (ready) ready.then((ph) => ph.capture(event, properties)).catch(() => {});
  else if (queue.length < 50) queue.push({ event, properties });
}

export function identify(id: string, properties?: Record<string, unknown>) {
  startPostHog()?.then((ph) => ph.identify(id, properties)).catch(() => {});
}

export function resetIdentity() {
  ready?.then((ph) => ph.reset()).catch(() => {});
}

/**
 * Feature flag / experiment variant. Returns `fallback` (the control) until
 * PostHog has loaded and resolved flags, and forever when analytics is off.
 */
export function useFeatureFlag<T extends string | boolean>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;
    // Never starts PostHog itself: the observability provider does that after the
    // first interaction, and the flag resolves whenever it's ready.
    const attach = () =>
      ready?.then((ph) => {
        const read = () => {
          const v = ph.getFeatureFlag(key);
          if (!cancelled && v !== undefined && v !== null) setValue(v as T);
        };
        ph.onFeatureFlags(read);
        read();
      });
    if (ready) attach();
    else window.addEventListener(READY_EVENT, attach, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener(READY_EVENT, attach);
    };
  }, [key]);

  return value;
}
