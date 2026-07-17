/**
 * StatsStrip — credibility band with real product numbers.
 */
const STATS = [
  { value: "18",   label: "Analysis engines" },
  { value: "6",    label: "Frameworks" },
  { value: "360",  label: "Celebrity charts" },
  { value: "100%", label: "Explainable scores" },
];

export default function StatsStrip() {
  return (
    <section className="border-y border-hairline">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`py-7 text-center border-hairline ${i % 2 === 1 ? "border-l" : ""} ${
              i >= 2 ? "border-t md:border-t-0" : ""
            } ${i > 0 ? "md:border-l" : ""}`}
          >
            <p className="font-display font-extrabold text-[26px] md:text-[28px] tracking-[-0.02em] text-gold-bright">
              {s.value}
            </p>
            <p className="text-[11px] tracking-[0.16em] uppercase font-semibold text-ink-muted mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
