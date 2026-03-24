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

interface AttractionData {
  attraction_archetype: string;
  pull_traits: string[];
  avoidance_traits: string[];
  pattern_score: number;
  insight: string;
}

interface InsightHook {
  hook: string;
  share_text: string;
  confidence: number;
}

interface AttractionAnalysis {
  attraction_prose: string;
  pull_deep_dive: string;
  avoidance_deep_dive: string;
  pattern_warning: string;
  growth_invitation: string;
}

interface AttractionResult {
  name: string;
  sign: string;
  mbti_type: string;
  attraction_data: AttractionData;
  insight_hook: InsightHook;
  analysis: AttractionAnalysis;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AttractionPage() {
  const [result, setResult]   = useState<AttractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(data: DiscoverFormData) {
    if (!data.name) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch<AttractionResult>("/discover/attraction", data);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const ad = result?.attraction_data;
  const an = result?.analysis;

  return (
    <main className="min-h-screen bg-[#06060f] px-4 md:px-6 py-8 md:py-16">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-rose-400/60 uppercase tracking-widest">Discover</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Attraction Archetype</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            What draws you in — and what it reveals about you.
          </p>
        </div>

        {/* Form — hidden once result is shown */}
        {!result && <DiscoverForm onSubmit={handleSubmit} loading={loading} error={error} />}

        {/* Skeleton */}
        {loading && <DiscoverSkeleton />}

        {/* Result */}
        <AnimatePresence>
          {result && ad && an && (
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
                <span className="px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-semibold">
                  {ad.attraction_archetype}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.sign}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.mbti_type}</span>
              </div>

              {/* Core insight */}
              <p className="text-sm text-zinc-400 leading-relaxed italic">{ad.insight}</p>

              {/* Insight card */}
              <InsightCard
                hook={result.insight_hook?.hook ?? ""}
                shareText={result.insight_hook?.share_text}
                name={result.name}
                tags={[ad.attraction_archetype, result.sign, result.mbti_type]}
                score={ad.pattern_score}
                hookType="attraction"
              />

              {/* Pull / Avoidance traits */}
              <RevealOnScroll>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
                    <p className="text-xs font-semibold text-rose-400/70 uppercase tracking-wider">Drawn To</p>
                    <ul className="space-y-1">
                      {ad.pull_traits.map((t) => (
                        <li key={t} className="text-xs text-zinc-300 flex items-center gap-1.5">
                          <span className="text-rose-400 shrink-0">+</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avoids</p>
                    <ul className="space-y-1">
                      {ad.avoidance_traits.map((t) => (
                        <li key={t} className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span className="text-zinc-600 shrink-0">−</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>

              {/* AI prose cards */}
              {([
                { key: "attraction_prose",    label: "Your Attraction Pattern" },
                { key: "pull_deep_dive",      label: "What You Chase"          },
                { key: "avoidance_deep_dive", label: "What You Run From"       },
                { key: "pattern_warning",     label: "The Risk"                },
                { key: "growth_invitation",   label: "The Evolution"           },
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
