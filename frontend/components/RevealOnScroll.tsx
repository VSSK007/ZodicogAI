"use client";

/**
 * RevealOnScroll
 * Wraps children in a motion.div that fades + slides up when it enters
 * the viewport. Respects `prefers-reduced-motion` — degrades to a plain div.
 *
 * Usage:
 *   <RevealOnScroll>
 *     <SomeCard />
 *   </RevealOnScroll>
 *
 *   <RevealOnScroll delay={0.15} y={16} className="col-span-2">
 *     <BigCard />
 *   </RevealOnScroll>
 */

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

interface Props {
  children: React.ReactNode;
  /** Additional class names applied to the wrapper */
  className?: string;
  /** Extra delay in seconds before the reveal begins */
  delay?: number;
  /** Y offset to translate from (default 28) */
  y?: number;
  /** Whether the animation triggers only once (default true) */
  once?: boolean;
  /** Viewport margin before the trigger fires (default "-80px") */
  margin?: string;
}

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  margin = "-80px",
}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
