"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CARDS = [
  {
    href: "/discover/archetype",
    title: "Love Archetype",
    tagline: "Who you are in love — before you even realize it.",
    emoji: "🜂",
    accent: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/25",
  },
  {
    href: "/discover/pattern",
    title: "Relationship Pattern",
    tagline: "The pattern you keep repeating — and why.",
    emoji: "↺",
    accent: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/25",
  },
  {
    href: "/discover/attraction",
    title: "Attraction Archetype",
    tagline: "What you're drawn to — and what it costs you.",
    emoji: "⟡",
    accent: "from-rose-500/10 to-rose-500/5",
    border: "border-rose-500/25",
  },
  {
    href: "/discover/recommendations",
    title: "Taste Profile",
    tagline: "Games, movies, sneakers — your personality decoded.",
    emoji: "◈",
    accent: "from-sky-500/10 to-sky-500/5",
    border: "border-sky-500/25",
  },
];

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-[#06060f] px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold text-amber-500/60 uppercase tracking-widest">Discover</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Who are you, really?
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Identity readings built from your zodiac and MBTI.
            Each one is a different angle on the same truth.
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
            >
              <Link
                href={card.href}
                className={`group block rounded-2xl border ${card.border} bg-gradient-to-br ${card.accent} p-5 md:p-6 hover:brightness-110 transition-all duration-200 tap-highlight-none`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    {card.emoji}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <p className="text-white font-semibold text-base">{card.title}</p>
                    <p className="text-zinc-400 text-sm leading-relaxed">{card.tagline}</p>
                  </div>
                  <svg
                    className="shrink-0 mt-0.5 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
