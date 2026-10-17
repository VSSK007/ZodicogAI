"use client";

/**
 * The zodiac wheel, loaded on demand (it sits below the fold on /today and in
 * the report hero). The wrapper reserves the wheel's footprint - a square plus,
 * for two signs, the aspect caption - so nothing moves when it arrives.
 */
import dynamic from "next/dynamic";

const Wheel = dynamic(() => import("@/components/ZodiacWheel"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full max-w-[20rem] mx-auto rounded-full bg-white/[0.03] animate-pulse" aria-hidden="true" />
  ),
});

export default function LazyZodiacWheel({
  signs,
  className = "",
  neutral = false,
}: {
  signs: string[];
  className?: string;
  /** Third-person aspect wording, for pages comparing public figures. */
  neutral?: boolean;
}) {
  const pair = signs.filter(Boolean).length >= 2;
  return (
    // 20rem square (w-full up to max) + 3 caption lines when there is an aspect to describe.
    <div className={className} style={{ minHeight: pair ? "calc(min(100%, 20rem) + 6rem)" : undefined }}>
      <Wheel signs={signs} neutral={neutral} />
    </div>
  );
}
