"use client";

/**
 * ResultReveal — staggers a finished reading's sections in one at a time
 * instead of the whole block appearing at once. Wrap the top-level result
 * container's direct children (the action row + each Card/section) and each
 * one fades up in sequence.
 *
 * Opaque-friendly: only the JSON-result pages use this. SSE streaming pages
 * (ConstellationStream) render their own progressive UI and skip it.
 */
import { motion } from "framer-motion";
import { Children, type ReactNode } from "react";
import { fadeUp, stagger } from "@/lib/motion";

export default function ResultReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {Children.map(children, (child) =>
        child == null ? child : (
          <motion.div variants={fadeUp}>{child}</motion.div>
        )
      )}
    </motion.div>
  );
}
