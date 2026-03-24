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

interface ArchetypeData {
  archetype: string;
  archetype_tagline: string;
  shadow: string;
  in_love: string;
  compatibility_note: string;
  scores: Record<string, number>;
}

interface InsightHook {
  hook: string;
  type: string;
  confidence: number;
  share_text: string;
}

interface ArchetypeAnalysis {
  archetype_prose: string;
  shadow_deep_dive: string;
  in_love_prose: string;
  compatibility_prose: string;
  growth_invitation: string;
}

interface ArchetypeResult {
  name: string;
  sign: string;
  mbti_type: string;
  archetype_data: ArchetypeData;
  insight_hook: InsightHook;
  analysis: ArchetypeAnalysis;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ArchetypePage() {
  const [result, setResult]   = useState<ArchetypeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(data: DiscoverFormData) {
    if (!data.name) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch<ArchetypeResult>("/discover/archetype", data);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const ad = result?.archetype_data;
  const an = result?.analysis;

  return (
    <main className="min-h-screen bg-[#06060f] px-4 md:px-6 py-8 md:py-16">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-500/60 uppercase tracking-widest">Discover</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Love Archetype</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Who you are in love — classified across 12 archetypes from your zodiac + MBTI.
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
                <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-semibold">
                  {ad.archetype}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.sign}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.mbti_type}</span>
              </div>

              {/* Tagline */}
              <p className="text-base text-zinc-300 font-medium italic">&ldquo;{ad.archetype_tagline}&rdquo;</p>

              {/* Insight card (viral hook) */}
              <InsightCard
                hook={result.insight_hook?.hook ?? ""}
                shareText={result.insight_hook?.share_text}
                name={result.name}
                tags={[ad.archetype, result.sign, result.mbti_type]}
                score={result.insight_hook?.confidence ? result.insight_hook.confidence * 100 : undefined}
                hookType="archetype"
              />

              {/* AI prose cards */}
              {([
                { key: "archetype_prose",    label: "Your Archetype"       },
                { key: "shadow_deep_dive",   label: "Your Shadow"          },
                { key: "in_love_prose",      label: "You in Love"          },
                { key: "compatibility_prose",label: "What You Need"        },
                { key: "growth_invitation",  label: "Your Next Evolution"  },
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

              {/* Archetype scores breakdown */}
              <RevealOnScroll>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Archetype Scores</p>
                  <div className="space-y-2">
                    {Object.entries(ad.scores)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([name, score]) => (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={name === ad.archetype ? "text-amber-400 font-semibold" : "text-zinc-500"}>{name}</span>
                            <span className="text-zinc-600">{score.toFixed(0)}</span>
                          </div>
                          <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${name === ad.archetype ? "bg-amber-400" : "bg-white/20"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((score / 90) * 100, 100)}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </RevealOnScroll>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
