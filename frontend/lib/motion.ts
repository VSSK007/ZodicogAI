/**
 * Shared Framer Motion variants and constants.
 * Import from here to keep all animation values consistent across the app.
 */
import type { Variants } from "framer-motion";

/** Apple-style ease curve — fast out, gentle settle */
export const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/** Spring ease — snappier, for interactive elements */
export const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

// ── Reveal variants ──────────────────────────────────────────────────────────

/** Default reveal: fade up from below */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: EASE } },
};

/** Pure opacity fade — no movement */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

/** Subtle scale reveal — appears to come forward */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/** Slide in from left */
export const slideLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: EASE } },
};

// ── Container variants ───────────────────────────────────────────────────────

/** Stagger container — children animate sequentially */
export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/** Tighter stagger for dense grids */
export const staggerTight: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

// ── Character-level ──────────────────────────────────────────────────────────

/**
 * Per-character reveal — used inside a stagger parent.
 * Apply to each <motion.span> in a split-text title.
 */
export const charReveal: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: EASE } },
};
