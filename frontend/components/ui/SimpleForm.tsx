"use client";

/**
 * SimpleForm — name + gender + day/month input (no MBTI).
 * The shared person form for color, numerology, and zodiac analyses.
 * Extracted from the previously-duplicated inline copies in
 * analyze/color and analyze/numerology.
 */
import { Glyph } from "@/components/ui/glyphs";

export interface SimplePersonState {
  name: string;
  day: string;
  month: string;
  gender: "M" | "F";
}

export function emptySimple(): SimplePersonState {
  return { name: "", day: "", month: "", gender: "M" };
}

export function validateSimple(p: SimplePersonState, label: string): string | null {
  if (!p.name.trim()) return `${label}: Name is required`;
  const d = Number(p.day), m = Number(p.month);
  if (!p.day || isNaN(d) || d < 1 || d > 31) return `${label}: Day must be 1–31`;
  if (!p.month || isNaN(m) || m < 1 || m > 12) return `${label}: Month must be 1–12`;
  return null;
}

const INPUT_SMALL =
  "bg-surface-raised border border-hairline px-3 py-3 md:py-2 rounded-control text-sm text-ink " +
  "placeholder:text-ink-faint focus:outline-none focus:border-hairline-accent transition-colors text-center";

export function SimpleForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SimplePersonState;
  onChange: (v: SimplePersonState) => void;
}) {
  const set =
    (key: keyof SimplePersonState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value });

  return (
    <div className="bg-white/[0.03] p-5 rounded-card border border-hairline space-y-3">
      <div className="flex gap-2 items-center border-b border-hairline pb-2.5">
        <input
          className="flex-1 bg-transparent text-base font-medium text-ink placeholder:text-ink-faint outline-none"
          placeholder={label}
          value={value.name}
          onChange={set("name")}
        />
        <div className="flex rounded-control overflow-hidden border border-hairline text-sm font-medium w-16 shrink-0">
          {(["M", "F"] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-label={g === "M" ? "Male" : "Female"}
              onClick={() => onChange({ ...value, gender: g })}
              className={`flex-1 py-1.5 flex items-center justify-center transition-colors tap-highlight-none ${
                value.gender === g
                  ? "bg-gold text-gold-ink"
                  : "bg-surface-raised text-ink-muted hover:text-ink"
              }`}
            >
              <Glyph name={g === "M" ? "mars" : "venus"} size={13} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <input className={`w-20 md:w-16 ${INPUT_SMALL}`} placeholder="Day" type="number" min={1} max={31} value={value.day} onChange={set("day")} />
        <input className={`w-20 md:w-16 ${INPUT_SMALL}`} placeholder="Mo" type="number" min={1} max={12} value={value.month} onChange={set("month")} />
      </div>
    </div>
  );
}
