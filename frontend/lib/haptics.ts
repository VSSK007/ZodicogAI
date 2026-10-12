/**
 * haptic() - a short vibration tick for primary actions, tab switches and the
 * score reveal. Only in the installed app (html[data-installed], set before
 * first paint), only where the Vibration API exists (not iOS), and never when
 * the visitor prefers reduced motion. A normal browser tab is silent.
 */
export function haptic(ms = 8) {
  if (typeof window === "undefined") return;
  try {
    if (document.documentElement.dataset.installed !== "true") return;
    if (typeof navigator.vibrate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate(ms);
  } catch {
    // Haptics are a nicety; never let them break a tap.
  }
}
