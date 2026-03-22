"use client";

import { useState } from "react";
import { MBTI_TYPES } from "@/lib/api";
import MbtiSelect from "./MbtiSelect";

export interface DiscoverFormData {
  name: string;
  day: number;
  month: number;
  mbti: string;
}

interface Props {
  onSubmit: (data: DiscoverFormData) => void;
  loading: boolean;
  error: string | null;
}

const INPUT = "w-full bg-white/[0.04] border border-white/10 px-3 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-colors rounded-lg";

export default function DiscoverForm({ onSubmit, loading, error }: Props) {
  const [name,  setName]  = useState("");
  const [day,   setDay]   = useState("");
  const [month, setMonth] = useState("");
  const [mbti,  setMbti]  = useState("");

  function validate(): string | null {
    if (!name.trim())                          return "Name is required";
    const d = Number(day), m = Number(month);
    if (!day  || isNaN(d) || d < 1 || d > 31) return "Day must be 1–31";
    if (!month || isNaN(m) || m < 1 || m > 12) return "Month must be 1–12";
    if (!MBTI_TYPES.includes(mbti.toUpperCase())) return "Select a valid MBTI type";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { onSubmit({ name: "", day: 0, month: 0, mbti: "" }); return; }
    onSubmit({ name: name.trim(), day: Number(day), month: Number(month), mbti });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className={INPUT}
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className={`${INPUT} flex-1`}
          placeholder="Day (1–31)"
          type="number"
          min={1} max={31}
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <input
          className={`${INPUT} flex-1`}
          placeholder="Month (1–12)"
          type="number"
          min={1} max={12}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>
      <MbtiSelect value={mbti} onChange={setMbti} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
      >
        {loading ? "Reading…" : "Reveal"}
      </button>
    </form>
  );
}
