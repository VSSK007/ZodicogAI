"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { renderMd } from "@/lib/renderMd";
import InsightCard from "@/components/InsightCard";
import DiscoverForm, { DiscoverFormData } from "@/components/DiscoverForm";
import DiscoverSkeleton from "@/components/DiscoverSkeleton";
import RevealOnScroll from "@/components/RevealOnScroll";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatternData {
  pattern_label: string;
  pattern_display: string;
  pattern_score: number;
  shadow_behaviour: string;
  root_cause: string;
  break_the_cycle: string;
}

interface InsightHook {
  hook: string;
  share_text: string;
  confidence: number;
}

interface PatternAnalysis {
  pattern_prose: string;
  shadow_deep_dive: string;
  root_cause_prose: string;
  break_the_cycle_prose: string;
  reframe: string;
}

interface PatternResult {
  name: string;
  sign: string;
  mbti_type: string;
  pattern_data: PatternData;
  insight_hook: InsightHook;
  analysis: PatternAnalysis;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PatternPage() {
  const [result, setResult]   = useState<PatternResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(data: DiscoverFormData) {
    if (!data.name) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch<PatternResult>("/discover/pattern", data);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const pd = result?.pattern_data;
  const an = result?.analysis;

  return (
    <main className="min-h-screen bg-[#06060f] px-4 md:px-6 py-8 md:py-16">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-violet-400/60 uppercase tracking-widest">Discover</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Relationship Pattern</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The cycle you keep repeating — classified from your zodiac + MBTI.
          </p>
        </div>

        {/* Form — hidden once result is shown */}
        {!result && <DiscoverForm onSubmit={handleSubmit} loading={loading} error={error} />}

        {/* Skeleton */}
        {loading && <DiscoverSkeleton />}

        {/* Result */}
        <AnimatePresence>
          {result && pd && an && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Reset */}
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Try again
              </button>

              {/* Identity pill */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-semibold">
                  {pd.pattern_display}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.sign}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.mbti_type}</span>
              </div>

              {/* Confidence bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span className="uppercase tracking-wider">Pattern match</span>
                  <span className="text-violet-400 font-semibold">{Math.round(pd.pattern_score)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pd.pattern_score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  />
                </div>
              </div>

              {/* Insight card */}
              <InsightCard
                hook={result.insight_hook?.hook ?? ""}
                shareText={result.insight_hook?.share_text}
                name={result.name}
                tags={[pd.pattern_display, result.sign, result.mbti_type]}
                hookType="pattern"
              />

              {/* AI prose cards */}
              {([
                { key: "pattern_prose",          label: "Your Pattern"         },
                { key: "shadow_deep_dive",        label: "The Shadow Side"      },
                { key: "root_cause_prose",        label: "Why You Do It"        },
                { key: "break_the_cycle_prose",   label: "Breaking the Cycle"   },
                { key: "reframe",                 label: "A Different Frame"     },
              ] as const).map(({ key, label }) => (
                <RevealOnScroll key={key}>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm text-zinc-300 leading-relaxed space-y-2">
                      {renderMd(an[key] ?? "")}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
