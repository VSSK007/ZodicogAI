"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PersonData } from "@/lib/api";
import MbtiSelect from "./MbtiSelect";
import MbtiQuiz from "./MbtiQuiz";

interface Props {
  label: string;
  value: PersonData;
  onChange: (v: PersonData) => void;
  compact?: boolean;
}

const INPUT = "rounded-lg bg-white/[0.04] md:bg-zinc-900 border border-amber-500/20 md:border-white/10 px-3 py-3 md:py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 md:focus:border-white/30 transition-colors";

export default function PersonForm({ label, value, onChange, compact = false }: Props) {
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("quiz-open", showQuiz);
    return () => { document.body.classList.remove("quiz-open"); };
  }, [showQuiz]);

  const set =
    (key: keyof PersonData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange({ ...value, [key]: key === "day" || key === "month" ? (v ? Number(v) : 0) : v });
    };

  return (
    <div className="rounded-2xl ring-1 ring-amber-500/25 md:ring-white/10 p-4 bg-amber-500/[0.04] md:bg-white/[0.03]">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-col gap-2">
        {/* Row 1: Name + Gender */}
        <div className="flex gap-2">
          <input
            className={`${INPUT} flex-1 min-w-0`}
            placeholder="Name"
            value={value.name}
            onChange={set("name")}
          />
          <div className="flex rounded-lg overflow-hidden border border-amber-500/25 md:border-white/[0.08] text-sm font-medium w-20 md:w-16 shrink-0">
            {(["M", "F"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...value, gender: g })}
                className={`flex-1 py-3 md:py-2 transition-colors tap-highlight-none ${
                  value.gender === g
                    ? "bg-amber-500 text-black"
                    : "bg-white/[0.04] md:bg-zinc-900 text-zinc-500 hover:text-white"
                }`}
              >
                {g === "M" ? "♂" : "♀"}
              </button>
            ))}
          </div>
        </div>
        {/* Row 2: MBTI + Day + Month */}
        <div className="flex gap-2">
          <MbtiSelect
            className="flex-1"
            value={value.mbti || ""}
            onChange={(v) => onChange({ ...value, mbti: v })}
          />
          <input
            className={`${INPUT} w-20 md:w-16 shrink-0 text-center`}
            placeholder="Day"
            type="number"
            min={1} max={31}
            value={value.day || ""}
            onChange={set("day")}
          />
          <input
            className={`${INPUT} w-20 md:w-16 shrink-0 text-center`}
            placeholder="Mo"
            type="number"
            min={1} max={12}
            value={value.month || ""}
            onChange={set("month")}
          />
        </div>
        {/* MBTI quiz toggle */}
        <button
          type="button"
          onClick={() => setShowQuiz((v) => !v)}
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition text-left pl-1 tap-highlight-none"
        >
          {showQuiz ? "▲ Hide quiz" : "▾ Don't know your MBTI? Take a quick quiz"}
        </button>
        <AnimatePresence>
          {showQuiz && (
            <MbtiQuiz
              onResult={(type) => { onChange({ ...value, mbti: type }); }}
              onClose={() => setShowQuiz(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
