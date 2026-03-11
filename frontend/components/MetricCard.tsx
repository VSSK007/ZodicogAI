interface Props {
  label: string;
  value: number | string;
  unit?: string;
  accent?: "green" | "amber" | "blue" | "indigo" | "rose" | "purple" | "teal" | "orange";
  sub?: string;
}

const STYLES: Record<string, { border: string; bg: string; text: string }> = {
  green:  { border: "border-green-500/30",  bg: "bg-green-500/5",  text: "text-green-400"  },
  amber:  { border: "border-amber-500/30",  bg: "bg-amber-500/5",  text: "text-amber-400"  },
  blue:   { border: "border-blue-500/30",   bg: "bg-blue-500/5",   text: "text-blue-400"   },
  indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/5", text: "text-indigo-400" },
  rose:   { border: "border-rose-500/30",   bg: "bg-rose-500/5",   text: "text-rose-400"   },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/5", text: "text-purple-400" },
  teal:   { border: "border-teal-500/30",   bg: "bg-teal-500/5",   text: "text-teal-400"   },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400" },
};

export default function MetricCard({ label, value, unit = "%", accent = "blue", sub }: Props) {
  const s = STYLES[accent] ?? STYLES.blue;
  const isNum = typeof value === "number";
  return (
    <div className={`rounded-xl border p-4 ${s.border} ${s.bg}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${s.text}`}>
        {isNum ? `${value.toFixed(1)}${unit}` : value}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}
