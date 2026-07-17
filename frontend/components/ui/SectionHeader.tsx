/**
 * SectionHeader — Eyebrow + display headline + optional subcopy.
 * The standard page/section opener across the site.
 */
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
  className = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <Eyebrow className={centered ? "justify-center" : ""}>{eyebrow}</Eyebrow>
      )}
      <h2 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.1] text-balance">
        {title}
      </h2>
      {sub && (
        <p className={`mt-3.5 text-ink-secondary ${centered ? "max-w-xl mx-auto" : "max-w-xl"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
