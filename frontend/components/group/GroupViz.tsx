"use client";

/**
 * GroupViz - the two views of a group's pairwise compatibility:
 *   GroupHeatmap  n x n grid (plain CSS grid, no chart library)
 *   GroupWeb      people on a circle, a line per pair (thickness and colour = score)
 */
import { useMemo } from "react";

export interface GroupResult {
  people: { name: string; sign: string; mbti: string }[];
  matrix: (number | null)[][];
  pairs: { a: number; b: number; score: number }[];
  averages: number[];
  group_score: number;
  glue: { index: number; name: string; average: number };
  strongest: { a: number; b: number; score: number; names: [string, string] };
  spiciest: { a: number; b: number; score: number; names: [string, string] };
  analysis: {
    group_dynamic: string;
    glue_note: string;
    strongest_pair_note: string;
    spiciest_pair_note: string;
    tip: string;
  };
}

/** Same bands as the report's ScoreChip, as plain colours for cells and lines. */
export function band(score: number) {
  if (score >= 80) return { tone: "success", color: "var(--color-success)", label: "Rare alignment" };
  if (score >= 65) return { tone: "accent", color: "var(--color-accent-bright)", label: "Strong" };
  if (score >= 45) return { tone: "warning", color: "var(--color-warning)", label: "Workable" };
  return { tone: "danger", color: "var(--color-danger)", label: "Friction" };
}

const CELL_BG: Record<string, string> = {
  success: "bg-success/20 text-success",
  accent: "bg-accent/20 text-accent-bright",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-danger",
};

function short(name: string, max = 9) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function GroupHeatmap({ result }: { result: GroupResult }) {
  const n = result.people.length;
  return (
    <div className="overflow-x-auto" data-testid="group-heatmap">
      <div
        role="table"
        aria-label="Pairwise compatibility"
        className="grid gap-1 min-w-[20rem]"
        style={{ gridTemplateColumns: `minmax(3.5rem, 5.5rem) repeat(${n}, minmax(2.25rem, 1fr))` }}
      >
        <div role="row" className="contents">
          <span role="columnheader" className="sr-only">Person</span>
          {result.people.map((p, j) => (
            <span key={j} role="columnheader" className="text-micro text-ink-muted text-center truncate self-end pb-1" title={p.name}>
              {short(p.name, 6)}
            </span>
          ))}
        </div>
        {result.people.map((p, i) => (
          <div key={i} role="row" className="contents">
            <span role="rowheader" className="text-xs text-ink-secondary truncate self-center pr-1" title={p.name}>
              {short(p.name, 10)}
            </span>
            {result.matrix[i].map((score, j) =>
              score === null ? (
                <span key={j} role="cell" aria-label={`${p.name} with themselves`} className="h-10 rounded-control bg-white/[0.02]" />
              ) : (
                <span
                  key={j}
                  role="cell"
                  aria-label={`${p.name} and ${result.people[j].name}: ${score.toFixed(0)}`}
                  title={`${p.name} + ${result.people[j].name}: ${score.toFixed(1)}`}
                  className={`h-10 rounded-control flex items-center justify-center text-xs font-semibold tabular-nums ${CELL_BG[band(score).tone]}`}
                >
                  {score.toFixed(0)}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupWeb({ result }: { result: GroupResult }) {
  const n = result.people.length;
  const SIZE = 360;
  const C = SIZE / 2;
  const R = 128;

  const nodes = useMemo(
    () =>
      result.people.map((_, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        return { x: C + R * Math.cos(angle), y: C + R * Math.sin(angle), angle };
      }),
    [result.people, n, C],
  );

  // Draw weaker lines first so strong ones sit on top.
  const lines = [...result.pairs].sort((a, b) => a.score - b.score);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`Group web: ${n} people. Strongest pair ${result.strongest.names.join(" and ")}, ${result.strongest.score.toFixed(0)}.`}
      className="w-full max-w-[26rem] mx-auto"
      data-testid="group-web"
    >
      {lines.map((p) => {
        const { color } = band(p.score);
        const w = 0.8 + Math.max(0, p.score - 35) / 14; // ~0.8 .. 5
        const isTop = p.a === result.strongest.a && p.b === result.strongest.b;
        return (
          <line
            key={`${p.a}-${p.b}`}
            x1={nodes[p.a].x} y1={nodes[p.a].y} x2={nodes[p.b].x} y2={nodes[p.b].y}
            stroke={color}
            strokeWidth={w}
            strokeLinecap="round"
            opacity={isTop ? 1 : 0.55}
          />
        );
      })}

      {result.people.map((p, i) => {
        const glue = i === result.glue.index;
        const { x, y } = nodes[i];
        // Labels sit outside the ring.
        const lx = C + (R + 30) * Math.cos(nodes[i].angle);
        const ly = C + (R + 30) * Math.sin(nodes[i].angle);
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={glue ? 13 : 10}
              fill="var(--color-surface-raised)"
              stroke={glue ? "var(--color-gold-bright)" : "var(--color-hairline-strong)"}
              strokeWidth={glue ? 2.5 : 1.5}
            />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-ink)">
              {p.name.charAt(0).toUpperCase()}
            </text>
            <text
              x={lx} y={ly + 3.5}
              textAnchor={lx < C - 6 ? "end" : lx > C + 6 ? "start" : "middle"}
              fontSize="11"
              fill={glue ? "var(--color-gold-bright)" : "var(--color-ink-secondary)"}
              fontWeight={glue ? 700 : 500}
            >
              {short(p.name, 12)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
