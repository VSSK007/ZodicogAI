"use client";
import { useState } from "react";

interface Props {
  name: string;
  signLabel: string;
  symbol: string;
  slug: string;
  lifePathNum: number | null;
  auraName: string;
}

export default function ShareCelebButton({ name, signLabel, symbol, slug, lifePathNum, auraName }: Props) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const url  = `https://zodicogai.com/celebrities/${slug}`;
    const text = `${name} ${symbol} ${signLabel}${lifePathNum ? ` · Life Path ${lifePathNum}` : ""} · ${auraName}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${name} — ZodicogAI`, text, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
    >
      {state === "copied" ? (
        <>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}
