"use client";

import { useState } from "react";
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

const INPUT = "rounded-lg bg-[#0d0d1a] border border-white/[0.08] px-3 py-3 md:py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-colors";

export default function PersonForm({ label, value, onChange, compact = false }: Props) {
  const [showQuiz, setShowQuiz] = useState(false);

  const set =
    (key: keyof PersonData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange({ ...value, [key]: key === "day" || key === "month" ? (v ? Number(v) : 0) : v });
    };

  return (
    <div className={`rounded-xl border border-white/[0.07] p-4 ${compact ? "bg-[#13131f]" : "bg-[#16162a]"}`}>
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
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08] text-sm font-medium w-20 md:w-16 shrink-0">
            {(["M", "F"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...value, gender: g })}
                className={`flex-1 py-3 md:py-2 transition-colors tap-highlight-none ${
                  value.gender === g
                    ? "bg-amber-500 text-black"
                    : "bg-[#0d0d1a] text-zinc-500 hover:text-white"
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
