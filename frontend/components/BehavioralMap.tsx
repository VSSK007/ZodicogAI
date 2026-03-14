"use client";

import { motion } from "framer-motion";
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
    <div className="rounded-2xl border border-white/[0.07] bg-[#16162a] p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-0.5">Behavioral Map</h3>
      <p className="text-xs text-zinc-500 mb-4">Dominance × Expressiveness</p>

      {/* Mobile: CSS quadrant map — hidden on desktop */}
      <div className="md:hidden relative h-52 rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
        {/* Cross-hair axis lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.07]" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.07]" />

        {/* Corner labels */}
        <span className="absolute top-2 left-2 text-[9px] text-white/20 uppercase tracking-widest">Empathic</span>
        <span className="absolute top-2 right-2 text-[9px] text-white/20 uppercase tracking-widest text-right">Dominant</span>
        <span className="absolute bottom-2 left-2 text-[9px] text-white/20 uppercase tracking-widest">Reserved</span>
        <span className="absolute bottom-2 right-2 text-[9px] text-white/20 uppercase tracking-widest text-right">Assertive</span>

        {/* Person A dot — white */}
        {aTraits && (
          <motion.div
            className="absolute w-3.5 h-3.5 rounded-full bg-white"
            style={{
              left: `${(aTraits.dominance / 10) * 90 + 5}%`,
              bottom: `${(aTraits.expressiveness / 10) * 90 + 5}%`,
              transform: "translate(-50%, 50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Person B dot — blue */}
        {bTraits && (
          <motion.div
            className="absolute w-3.5 h-3.5 rounded-full bg-[#3b82f6]"
            style={{
              left: `${(bTraits.dominance / 10) * 90 + 5}%`,
              bottom: `${(bTraits.expressiveness / 10) * 90 + 5}%`,
              transform: "translate(-50%, 50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        )}

        {/* Legend below chart */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-[9px] text-zinc-500">
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-white mr-1" />
            {nameA}
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
            {nameB}
          </span>
        </div>
      </div>

      {/* Desktop: Recharts scatter chart — hidden on mobile */}
      <div className="hidden md:block">
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
            <Tooltip
              cursor={false}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#1e1e35] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white">
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

        {/* Quadrant labels as a 2×2 grid below the chart */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 px-2">
          <div className="text-left">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">↑ Low Dom · High Exp</span>
            <span className="ml-2 text-[10px] font-medium text-white/20">Empathic</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-medium text-white/20">Dominant</span>
            <span className="ml-2 text-[10px] text-zinc-600 uppercase tracking-widest">High Dom · High Exp ↑</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">↓ Low Dom · Low Exp</span>
            <span className="ml-2 text-[10px] font-medium text-white/20">Reserved</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-medium text-white/20">Assertive</span>
            <span className="ml-2 text-[10px] text-zinc-600 uppercase tracking-widest">High Dom · Low Exp ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
