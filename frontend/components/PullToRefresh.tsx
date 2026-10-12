"use client";

/**
 * PullToRefresh - pull the page down from the top to re-fetch its data
 * without a full reload. Active only in the installed app on phones/tablets
 * (html[data-installed], below lg); everywhere else it renders its children
 * untouched. While mounted it turns off the browser's own pull-to-refresh
 * (which would reload the whole app) for this page.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star4 } from "@/components/ui/glyphs";
import { haptic } from "@/lib/haptics";

const THRESHOLD = 70; // px of (damped) pull needed to trigger
const MAX_PULL = 110;
const DAMPING = 0.5;

export default function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown> | void;
  children: React.ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    const html = document.documentElement;
    const enabled = () => html.dataset.installed === "true" && window.matchMedia("(max-width: 1023px)").matches;
    if (!enabled()) return;

    const previous = html.style.overscrollBehaviorY;
    html.style.overscrollBehaviorY = "contain";

    let startY: number | null = null;
    let current = 0;
    let busy = false;

    const onStart = (e: TouchEvent) => {
      if (busy || window.scrollY > 0 || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0 || window.scrollY > 0) {
        current = 0;
        setPull(0);
        return;
      }
      current = Math.min(MAX_PULL, dy * DAMPING);
      setPull(current);
    };
    const onEnd = async () => {
      if (startY === null) return;
      startY = null;
      if (current >= THRESHOLD && !busy) {
        busy = true;
        haptic(12);
        setRefreshing(true);
        setPull(THRESHOLD);
        try {
          await refreshRef.current();
        } finally {
          busy = false;
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
      current = 0;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      html.style.overscrollBehaviorY = previous;
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const visible = pull > 4 || refreshing;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <>
      {visible && (
        <div
          data-testid="pull-indicator"
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none"
          style={{ transform: `translateY(${Math.max(8, pull - 28)}px)`, opacity: Math.max(0.35, progress) }}
        >
          <span className="size-10 rounded-full bg-surface-overlay border border-hairline-gold flex items-center justify-center text-gold-bright shadow-panel">
            <motion.span
              animate={refreshing ? { rotate: 360 } : { rotate: progress * 180 }}
              transition={refreshing ? { repeat: Infinity, duration: 1.2, ease: "linear" } : { duration: 0 }}
              className="flex"
            >
              <Star4 size={16} />
            </motion.span>
            <span className="sr-only">{refreshing ? "Refreshing" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}</span>
          </span>
        </div>
      )}
      {children}
    </>
  );
}
