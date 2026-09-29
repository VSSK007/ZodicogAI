"use client";

/**
 * Wires the observability layer once, at the root:
 *  - global error handlers -> Sentry (lazy)
 *  - PostHog init after first interaction / idle, plus a pageview per route
 *  - Core Web Vitals from real visitors (LCP, INP, CLS...) -> Google Analytics
 *    and PostHog, so the Lighthouse budget can be checked against field data
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { sendGAEvent } from "@next/third-parties/google";
import { installGlobalErrorHandlers } from "@/lib/monitoring";
import { capture, startPostHog } from "@/lib/posthog";

const IDLE_FALLBACK_MS = 6000;

export default function ObservabilityProvider() {
  const pathname = usePathname();

  useEffect(() => {
    installGlobalErrorHandlers();

    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    const go = () => {
      startPostHog();
      cleanup();
    };
    const timer = window.setTimeout(go, IDLE_FALLBACK_MS);
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    function cleanup() {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, go));
    }
    return cleanup;
  }, []);

  useEffect(() => {
    capture("$pageview", { path: pathname });
  }, [pathname]);

  useReportWebVitals((metric) => {
    const value = Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value);
    try {
      sendGAEvent("event", metric.name, {
        value,
        metric_id: metric.id,
        metric_rating: metric.rating,
        non_interaction: true,
      });
    } catch {
      /* GA not loaded yet */
    }
    capture("web_vital", { name: metric.name, value: metric.value, rating: metric.rating, path: pathname });
  });

  return null;
}
