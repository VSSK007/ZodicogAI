"use client";

/**
 * Chart components loaded on demand. Recharts (+ its helpers) is ~350 KB and
 * charts only appear once a result exists, so nothing on the form views or the
 * marketing pages should pay for it. Import TraitRadar / BehavioralMap from
 * here rather than from their own files.
 */
import dynamic from "next/dynamic";

const Placeholder = ({ height }: { height: string }) => (
  <div className={`${height} rounded-card bg-white/[0.03] animate-pulse`} aria-hidden="true" />
);

export const TraitRadar = dynamic(() => import("@/components/TraitRadar"), {
  ssr: false,
  loading: () => <Placeholder height="h-[300px]" />,
});

export const BehavioralMap = dynamic(() => import("@/components/BehavioralMap"), {
  ssr: false,
  loading: () => <Placeholder height="h-[340px]" />,
});
