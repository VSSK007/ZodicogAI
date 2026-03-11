"use client";

import { PersonData, MBTI_TYPES } from "@/lib/api";

interface Props {
  label: string;
  value: PersonData;
  onChange: (v: PersonData) => void;
  compact?: boolean;
}

const INPUT = "w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors";

export default function PersonForm({ label, value, onChange, compact = false }: Props) {
  const set =
    (key: keyof PersonData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: e.target.value });

  return (
    <div className={`rounded-xl border border-white/10 p-4 ${compact ? "bg-zinc-900/60" : "bg-white/5"}`}>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={INPUT}
          placeholder="Name"
          value={value.name}
          onChange={set("name")}
        />
        <select className={INPUT} value={value.mbti} onChange={set("mbti")}>
          <option value="">MBTI type</option>
          {MBTI_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          className={INPUT}
          placeholder="Day (1–31)"
          type="number"
          min={1} max={31}
          value={value.day}
          onChange={set("day")}
        />
        <input
          className={INPUT}
          placeholder="Month (1–12)"
          type="number"
          min={1} max={12}
          value={value.month}
          onChange={set("month")}
        />
      </div>
    </div>
  );
}
