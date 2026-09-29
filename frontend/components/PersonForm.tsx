"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PersonData } from "@/lib/api";
import MbtiSelect from "./MbtiSelect";
import MbtiQuiz from "./MbtiQuiz";
import ProfileNotice from "@/components/ui/ProfileNotice";

interface Props {
  label: string;
  value: PersonData;
  onChange: (v: PersonData) => void;
  compact?: boolean;
  /** Marks this as the visitor's own form: shows the remember-me / saved-profile strip. */
  self?: boolean;
}

const INPUT_SMALL = "bg-white/[0.04] border border-hairline-strong px-3 py-3 md:py-2 text-white text-sm placeholder-ink-faint focus:outline-none focus:border-hairline-accent transition-colors rounded-lg";

export default function PersonForm({ label, value, onChange, self = false }: Props) {
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
    <div>
    <div className="rounded-2xl ring-1 ring-hairline p-5 bg-white/[0.03]">
      <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-col gap-2">
        {/* Row 1: Name + Gender — transparent underline style */}
        <div className="flex gap-2 items-center border-b border-hairline pb-2.5">
          <input
            className="flex-1 min-w-0 bg-transparent text-base font-medium placeholder:text-ink-muted outline-none text-white"
            placeholder="Name"
            value={value.name}
            onChange={set("name")}
          />
          <div className="flex rounded-lg overflow-hidden border border-hairline-strong text-sm font-medium w-16 shrink-0">
            {(["M", "F"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...value, gender: g })}
                className={`flex-1 py-1.5 transition-colors tap-highlight-none ${
                  value.gender === g
                    ? "bg-gold text-black"
                    : "bg-white/[0.04] text-ink-muted hover:text-white"
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
            className={`${INPUT_SMALL} w-20 md:w-16 shrink-0 text-center`}
            placeholder="Day"
            type="number"
            min={1} max={31}
            value={value.day || ""}
            onChange={set("day")}
          />
          <input
            className={`${INPUT_SMALL} w-20 md:w-16 shrink-0 text-center`}
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
          className="text-micro text-ink-muted hover:text-ink-secondary transition text-left pl-1 tap-highlight-none"
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
    {self && <ProfileNotice person={value} />}
    </div>
  );
}
