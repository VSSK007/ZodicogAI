"use client";

/**
 * App-wide reduced-motion handling for Framer Motion: when the OS asks for
 * reduced motion, transform/layout animations are skipped and only opacity
 * changes remain. (CSS animations are covered by the media query in globals.css.)
 */
import { MotionConfig } from "framer-motion";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
