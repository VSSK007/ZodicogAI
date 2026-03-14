"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Traits = {
  intensity: number;
  stability: number;
  expressiveness: number;
  dominance: number;
  adaptability: number;
};

type Props = {
  a?: Traits;
  b?: Traits;
  nameA?: string;
  nameB?: string;
};

const COLOR_A = "#a78bfa"; // violet
const COLOR_B = "#fb7185"; // rose

interface TooltipItem {
  name: string;
  value: number;
  color: string;
  payload?: { trait: string };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipItem[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1e35] border border-white/[0.08] rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-zinc-400 font-medium mb-1">{payload[0]?.payload?.trait}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Number(p.value).toFixed(1)} / 10
        </p>
      ))}
    </div>
  );
}

export default function TraitRadar({ a, b, nameA = "Person A", nameB = "Person B" }: Props) {
  if (!a && !b) {
    return <div className="text-zinc-500 text-sm">Trait data unavailable</div>;
  }

  const data = [
    { trait: "Intensity",      A: a?.intensity      ?? 0, B: b?.intensity      ?? 0 },
    { trait: "Stability",      A: a?.stability      ?? 0, B: b?.stability      ?? 0 },
    { trait: "Expressive",     A: a?.expressiveness ?? 0, B: b?.expressiveness ?? 0 },
    { trait: "Dominance",      A: a?.dominance      ?? 0, B: b?.dominance      ?? 0 },
    { trait: "Adaptability",   A: a?.adaptability   ?? 0, B: b?.adaptability   ?? 0 },
  ];

  const showLegend = !!(a && b);

  return (
    <div className="w-full">
      {/* Legend */}
      {showLegend && (
        <div className="flex gap-5 mb-4 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
            {nameA}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_B }} />
            {nameB}
          </span>
        </div>
      )}

      <div className="w-full h-[220px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              gridType="polygon"
            />

            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: "#71717a", fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />

            {/* Hide radius axis numbers — grid rings convey scale visually */}
            <PolarRadiusAxis
              domain={[0, 10]}
              tickCount={6}
              tick={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {a && (
              <Radar
                name={nameA}
                dataKey="A"
                stroke={COLOR_A}
                strokeWidth={1.5}
                fill={COLOR_A}
                fillOpacity={0.15}
                dot={{ r: 3, fill: COLOR_A, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COLOR_A, strokeWidth: 0 }}
              />
            )}

            {b && (
              <Radar
                name={nameB}
                dataKey="B"
                stroke={COLOR_B}
                strokeWidth={1.5}
                fill={COLOR_B}
                fillOpacity={0.15}
                dot={{ r: 3, fill: COLOR_B, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COLOR_B, strokeWidth: 0 }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
