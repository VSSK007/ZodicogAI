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

interface RecommendationData {
  gaming_profile: string;
  gaming_genres: string[];
  gaming_titles: string[];
  gaming_reasoning: string;
  movie_profile: string;
  movie_genres: string[];
  movie_titles: string[];
  movie_reasoning: string;
  sneaker_profile: string;
  sneaker_brands: string[];
  sneaker_reasoning: string;
}

interface InsightHook {
  hook: string;
  share_text: string;
}

interface RecommendationAnalysis {
  gaming_prose: string;
  movie_prose: string;
  sneaker_prose: string;
  taste_profile: string;
}

interface RecommendationResult {
  name: string;
  sign: string;
  mbti_type: string;
  recommendation_data: RecommendationData;
  insight_hook: InsightHook;
  analysis: RecommendationAnalysis;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RecommendationsPage() {
  const [result, setResult]   = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(data: DiscoverFormData) {
    if (!data.name) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch<RecommendationResult>("/discover/recommendations", data);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const rd = result?.recommendation_data;
  const an = result?.analysis;

  return (
    <main className="min-h-screen bg-[#06060f] px-4 md:px-6 py-8 md:py-16">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-sky-400/60 uppercase tracking-widest">Discover</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Taste Profile</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Games, movies, sneakers — your personality decoded through what you love.
          </p>
        </div>

        {/* Form */}
        <DiscoverForm onSubmit={handleSubmit} loading={loading} error={error} />

        {/* Skeleton */}
        {loading && <DiscoverSkeleton />}

        {/* Result */}
        <AnimatePresence>
          {result && rd && an && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.sign}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs">{result.mbti_type}</span>
              </div>

              {/* Insight card */}
              <InsightCard
                hook={result.insight_hook?.hook ?? ""}
                shareText={result.insight_hook?.share_text}
                name={result.name}
                tags={[result.sign, result.mbti_type]}
                hookType="taste"
              />

              {/* Taste profile prose */}
              <RevealOnScroll>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Taste Profile</p>
                  <div className="text-sm text-zinc-300 leading-relaxed space-y-2">
                    {renderMd(an.taste_profile ?? "")}
                  </div>
                </div>
              </RevealOnScroll>

              {/* Three category cards */}
              {[
                {
                  label: "Gaming",
                  profile: rd.gaming_profile,
                  genres: rd.gaming_genres,
                  titles: rd.gaming_titles,
                  prose: an.gaming_prose,
                  accent: "border-sky-500/20 bg-sky-500/[0.04]",
                  dot: "bg-sky-400",
                },
                {
                  label: "Movies",
                  profile: rd.movie_profile,
                  genres: rd.movie_genres,
                  titles: rd.movie_titles,
                  prose: an.movie_prose,
                  accent: "border-amber-500/20 bg-amber-500/[0.04]",
                  dot: "bg-amber-400",
                },
                {
                  label: "Sneakers",
                  profile: rd.sneaker_profile,
                  genres: rd.sneaker_brands,
                  titles: [],
                  prose: an.sneaker_prose,
                  accent: "border-rose-500/20 bg-rose-500/[0.04]",
                  dot: "bg-rose-400",
                },
              ].map(({ label, profile, genres, titles, prose, accent, dot }) => (
                <RevealOnScroll key={label}>
                  <div className={`rounded-2xl border ${accent} p-5 space-y-3`}>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-white font-medium">{profile}</p>

                    {/* Genre/brand pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {genres.map((g) => (
                        <span key={g} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.07] text-xs text-zinc-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Titles */}
                    {titles.length > 0 && (
                      <div className="space-y-0.5">
                        {titles.map((t) => (
                          <p key={t} className="text-xs text-zinc-500">— {t}</p>
                        ))}
                      </div>
                    )}

                    {/* Prose */}
                    <div className="text-sm text-zinc-400 leading-relaxed pt-1 border-t border-white/[0.05] space-y-1">
                      {renderMd(prose ?? "")}
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
