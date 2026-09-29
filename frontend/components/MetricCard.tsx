interface Props {
  label: string;
  value: number | string;
  unit?: string;
  /** Legacy hue names are kept so call sites stay unchanged; each maps onto a design token. */
  accent?: "green" | "amber" | "blue" | "indigo" | "rose" | "purple" | "teal" | "orange";
  sub?: string;
}

type Tone = { border: string; bg: string; text: string };

const ACCENT: Tone = { border: "border-hairline-accent", bg: "bg-accent/5",  text: "text-accent-bright" };
const GOLD: Tone   = { border: "border-hairline-gold",   bg: "bg-gold/5",    text: "text-gold-bright" };
const SUCCESS: Tone = { border: "border-success/30",     bg: "bg-success/5", text: "text-success" };
const DANGER: Tone = { border: "border-danger/30",       bg: "bg-danger/5",  text: "text-danger" };

const TONES: Record<NonNullable<Props["accent"]>, Tone> = {
  blue: ACCENT, indigo: ACCENT, purple: ACCENT,
  amber: GOLD, orange: GOLD,
  green: SUCCESS, teal: SUCCESS,
  rose: DANGER,
};

export default function MetricCard({ label, value, unit = "%", accent = "blue", sub }: Props) {
  const t = TONES[accent] ?? ACCENT;
  return (
    <div className={`rounded-card border p-4 ${t.border} ${t.bg}`}>
      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${t.text}`}>
        {typeof value === "number" ? `${value.toFixed(1)}${unit}` : value}
      </p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}
