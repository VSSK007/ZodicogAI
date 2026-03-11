"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Traits {
  dominance: number;
  expressiveness: number;
  intensity: number;
  stability: number;
  adaptability: number;
}

interface Props {
  nameA?: string;
  nameB?: string;
  aTraits?: Traits;
  bTraits?: Traits;
}

const QUADRANT_LABELS = [
  { x: 1.5, y: 8.5, label: "Empathic" },
  { x: 7,   y: 8.5, label: "Dominant" },
  { x: 1.5, y: 1.5, label: "Reserved" },
  { x: 7,   y: 1.5, label: "Assertive" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomDot = ({ cx, cy, payload }: any) => (
  <g>
    <circle cx={cx} cy={cy} r={9} fill={payload.fill} fillOpacity={0.85} />
    <text x={cx + 13} y={cy + 4} fill="rgba(255,255,255,0.65)" fontSize={11}>
      {payload.label}
    </text>
  </g>
);

export default function BehavioralMap({ nameA = "Person A", nameB = "Person B", aTraits, bTraits }: Props) {
  if (!aTraits && !bTraits) return null;

  const points = [
    ...(aTraits ? [{ x: aTraits.dominance, y: aTraits.expressiveness, fill: "#ffffff", label: nameA }] : []),
    ...(bTraits ? [{ x: bTraits.dominance, y: bTraits.expressiveness, fill: "#3b82f6", label: nameB }] : []),
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-0.5">Behavioral Map</h3>
      <p className="text-xs text-zinc-500 mb-4">Dominance × Expressiveness</p>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 10, right: 40, bottom: 24, left: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
          <XAxis
            type="number" dataKey="x"
            domain={[0, 10]} tickCount={6}
            tick={{ fill: "#52525b", fontSize: 11 }}
            label={{ value: "Dominance →", position: "insideBottom", offset: -10, fill: "#52525b", fontSize: 11 }}
          />
          <YAxis
            type="number" dataKey="y"
            domain={[0, 10]} tickCount={6}
            tick={{ fill: "#52525b", fontSize: 11 }}
            label={{ value: "Expressiveness →", angle: -90, position: "insideLeft", offset: 10, fill: "#52525b", fontSize: 11 }}
          />
          <ReferenceLine x={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
          <ReferenceLine y={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
          {QUADRANT_LABELS.map((q) => (
            <ReferenceLine
              key={q.label}
              x={q.x} y={q.y}
              stroke="transparent"
              label={{ value: q.label, fill: "rgba(255,255,255,0.12)", fontSize: 10 }}
            />
          ))}
          <Tooltip
            cursor={false}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                  <p className="font-semibold mb-1">{d.label}</p>
                  <p>Dominance: {d.x} / 10</p>
                  <p>Expressiveness: {d.y} / 10</p>
                </div>
              );
            }}
          />
          <Scatter data={points} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
