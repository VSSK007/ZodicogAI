"use client";

/**
 * Loads Google Analytics after the page has become interactive-and-touched
 * (first pointer/key/scroll/touch) or after an idle fallback, instead of on
 * hydration. GTM costs ~170 KB and a few hundred ms of main-thread time on a
 * mid-range phone; none of it is needed to render the page. Events that matter
 * (analysis completed, share, Zodicognac opened) all happen after an
 * interaction, so nothing meaningful is lost.
 */
import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

const IDLE_FALLBACK_MS = 6000;

export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    const go = () => {
      setReady(true);
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

  return ready ? <GoogleAnalytics gaId={gaId} /> : null;
}
