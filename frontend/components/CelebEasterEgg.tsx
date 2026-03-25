"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Phase sequencer
   enter → raise → kiss → hearts → rain → exit
───────────────────────────────────────────────────────────────────────────── */
type Phase = "enter" | "raise" | "kiss" | "hearts" | "rain" | "exit";

function usePhase(onDone: () => void): Phase {
  const [phase, setPhase] = useState<Phase>("enter");
  useEffect(() => {
    const seq: [Phase, number][] = [
      ["raise",  700],
      ["kiss",   1300],
      ["hearts", 1700],
      ["rain",   2300],
      ["exit",   4000],
    ];
    const timers = seq.map(([p, t]) => setTimeout(() => setPhase(p), t));
    const close  = setTimeout(onDone, 5000);
    return () => [...timers, close].forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return phase;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Heart burst
───────────────────────────────────────────────────────────────────────────── */
const HEART = "M 0,-5 C 6,-13 18,-8 18,1 C 18,9 10,15 0,21 C -10,15 -18,9 -18,1 C -18,-8 -6,-13 0,-5 Z";

function HeartBurst({ ox, oy, palette }: { ox: number; oy: number; palette: string[] }) {
  const spots = [
    { dx:  0,  dy: -55, s: 0.55, d: 0    },
    { dx:  26, dy: -70, s: 0.38, d: 0.10 },
    { dx: -24, dy: -60, s: 0.45, d: 0.18 },
    { dx:  40, dy: -40, s: 0.30, d: 0.06 },
    { dx: -38, dy: -35, s: 0.32, d: 0.14 },
    { dx:  12, dy: -88, s: 0.28, d: 0.22 },
  ];
  return (
    <>
      {spots.map((sp, i) => (
        <motion.g
          key={i}
          initial={{ translateX: ox, translateY: oy, scale: 0, opacity: 0 }}
          animate={{
            translateX: ox + sp.dx,
            translateY: oy + sp.dy,
            scale:   [0, sp.s * 1.3, sp.s],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.8, delay: sp.d, ease: "easeOut" }}
        >
          <path d={HEART} fill={palette[i % palette.length]} />
        </motion.g>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Word rain — Gilroy Light, italic, dribbling from top
───────────────────────────────────────────────────────────────────────────── */

// Deterministic sprinkle drops — varied position, diagonal drift, rotation
const SPRINKLE = Array.from({ length: 18 }, (_, i) => {
  const h = ((i * 17 + 5) % 10) / 10; // pseudo-hash 0–1
  return {
    left:    `${5 + ((i * 43 + 9) % 86)}%`,
    driftX:  -30 + (i % 9) * 8,         // -30 to +34px horizontal wander
    delay:   (i * 0.13) % 1.5,
    dur:     3.2 + h * 1.8,              // 3.2–5s — slow, peaceful
    size:    `${0.88 + (i % 4) * 0.17}rem`,
    opacity: 0.38 + (i % 5) * 0.12,
    rotate:  -14 + (i % 7) * 5,         // -14 to +16 deg
  };
});

function WordRain({ word, color, glow }: { word: string; color: string; glow: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
      {SPRINKLE.map((d, i) => (
        <motion.div
          key={i}
          // rotate goes in initial/animate so Framer Motion composes it
          // with x/y inside a single transform — never put rotate in style.transform
          initial={{ x: 0,       y: -55,  opacity: 0,         rotate: d.rotate }}
          animate={{ x: d.driftX, y: 900, opacity: [0, d.opacity, d.opacity, 0], rotate: d.rotate }}
          transition={{
            duration: d.dur,
            delay:    d.delay,
            ease:     "easeIn",
            opacity:  { duration: d.dur, delay: d.delay, times: [0, 0.10, 0.82, 1] },
          }}
          style={{
            position:      "absolute",
            left:          d.left,
            top:           0,
            fontSize:      d.size,
            fontFamily:    "'Gilroy', sans-serif",
            fontWeight:    300,
            fontStyle:     "italic",
            color,
            textShadow:    `0 0 10px ${glow}`,
            whiteSpace:    "nowrap",
            letterSpacing: "0.14em",
          }}
        >
          {word}
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Ghibli face — Sabrina Carpenter
   Round, cute, rosy · blonde wavy hair · blue eyes · pink outfit · freckles
───────────────────────────────────────────────────────────────────────────── */
function SabrinaFace({ phase }: { phase: Phase }) {
  const raised  = phase !== "enter";
  const kissing = ["kiss","hearts","rain","exit"].includes(phase);
  const hearts  = ["hearts","rain"].includes(phase);

  return (
    <svg viewBox="0 0 200 275" width="100%" style={{ maxHeight: "44vh" }}>

      {/* Hair back */}
      <path d="M 26 122 Q 28 26, 100 20 Q 172 26, 174 122 Q 164 33, 100 28 Q 36 33, 26 122 Z"
        fill="#a07808" />

      {/* Face — rounder, wider */}
      <ellipse cx="100" cy="128" rx="73" ry="83" fill="#fde8d8" />

      {/* Hair sides — wavy */}
      <path d="M 26 122 Q 18 160, 28 196 Q 38 200, 40 178 Q 34 155, 36 134 Q 30 128, 26 122 Z"
        fill="#c89514" />
      <path d="M 174 122 Q 182 160, 172 196 Q 162 200, 160 178 Q 166 155, 164 134 Q 170 128, 174 122 Z"
        fill="#c89514" />
      {/* Wavy hair ends */}
      <path d="M 28 196 Q 22 214, 32 226 Q 38 218, 40 202 Q 34 200, 28 196 Z" fill="#c89514" />
      <path d="M 172 196 Q 178 214, 168 226 Q 162 218, 160 202 Q 166 200, 172 196 Z" fill="#c89514" />

      {/* Bangs */}
      <path d="M 42 78 Q 66 48, 100 44 Q 134 48, 158 78 Q 136 60, 100 57 Q 64 60, 42 78 Z"
        fill="#e8b820" />
      {/* Highlight strand */}
      <path d="M 78 52 Q 82 44, 88 50" stroke="#f5d060" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Hair bow — small pink ribbon */}
      <path d="M 148 52 Q 158 44, 164 52 Q 158 58, 148 52 Z" fill="#f472b6" />
      <path d="M 164 52 Q 174 44, 180 52 Q 174 58, 164 52 Z" fill="#f472b6" />
      <circle cx="164" cy="52" r="4" fill="#ec4899" />

      {/* ── LEFT EYE — bigger, rounder, sparkly ── */}
      <ellipse cx="72" cy="110" rx="22" ry="24" fill="white" />
      <ellipse cx="72" cy="114" rx="16" ry="18" fill="#5aaade" />
      <ellipse cx="72" cy="115" rx="10" ry="12" fill="#0d1e30" />
      <ellipse cx="78" cy="107" rx="6"  ry="7"  fill="white" />
      <circle  cx="65" cy="113" r="3"   fill="white" opacity="0.70" />
      <circle  cx="69" cy="120" r="1.5" fill="white" opacity="0.45" />
      <path d="M 50 96 Q 72 88, 93 96"
        stroke="#180e08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Lashes */}
      <line x1="52"  y1="100" x2="48"  y2="94"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="63"  y1="90"  x2="61"  y2="83"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="80"  y1="89"  x2="81"  y2="82"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="91"  y1="96"  x2="95"  y2="92"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── RIGHT EYE — bigger, rounder, sparkly ── */}
      <ellipse cx="128" cy="110" rx="22" ry="24" fill="white" />
      <ellipse cx="128" cy="114" rx="16" ry="18" fill="#5aaade" />
      <ellipse cx="128" cy="115" rx="10" ry="12" fill="#0d1e30" />
      <ellipse cx="134" cy="107" rx="6"  ry="7"  fill="white" />
      <circle  cx="121" cy="113" r="3"   fill="white" opacity="0.70" />
      <circle  cx="125" cy="120" r="1.5" fill="white" opacity="0.45" />
      <path d="M 107 96 Q 128 88, 150 96"
        stroke="#180e08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="109" y1="100" x2="105" y2="94"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="119" y1="90"  x2="117" y2="83"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="136" y1="89"  x2="137" y2="82"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="147" y1="96"  x2="151" y2="92"  stroke="#180e08" strokeWidth="1.5" strokeLinecap="round" />

      {/* Freckles */}
      <circle cx="88"  cy="138" r="1.6" fill="#d08060" opacity="0.50" />
      <circle cx="96"  cy="142" r="1.4" fill="#d08060" opacity="0.45" />
      <circle cx="104" cy="142" r="1.4" fill="#d08060" opacity="0.45" />
      <circle cx="112" cy="138" r="1.6" fill="#d08060" opacity="0.50" />
      <circle cx="78"  cy="136" r="1.2" fill="#d08060" opacity="0.35" />
      <circle cx="122" cy="136" r="1.2" fill="#d08060" opacity="0.35" />

      {/* Nose — cute dot style */}
      <circle cx="95"  cy="145" r="2.2" fill="#d08868" opacity="0.70" />
      <circle cx="105" cy="145" r="2.2" fill="#d08868" opacity="0.70" />

      {/* Mouth */}
      {kissing
        ? <ellipse cx="100" cy="158" rx="9" ry="7" fill="#e04870" />
        : <path d="M 84 154 Q 100 168, 116 154"
            fill="none" stroke="#e04870" strokeWidth="3" strokeLinecap="round" />
      }

      {/* Cheeks — prominent rosy */}
      <ellipse cx="55"  cy="140" rx="20" ry="12" fill="#f8a8a8" opacity="0.65" />
      <ellipse cx="145" cy="140" rx="20" ry="12" fill="#f8a8a8" opacity="0.65" />

      {/* Neck */}
      <rect x="84" y="208" width="32" height="30" rx="12" fill="#fde8d8" />

      {/* Dress */}
      <path d="M 0 275 Q 35 215, 84 206 L 84 234 Q 44 246, 12 275 Z"  fill="#f472b6" />
      <path d="M 200 275 Q 165 215, 116 206 L 116 234 Q 156 246, 188 275 Z" fill="#f472b6" />
      <path d="M 84 234 Q 100 240, 116 234 L 116 206 Q 100 212, 84 206 Z"   fill="#ec4899" />
      {/* Dress sparkle detail */}
      <circle cx="100" cy="224" r="2.5" fill="#fde68a" opacity="0.60" />
      <circle cx="90"  cy="232" r="1.8" fill="#fde68a" opacity="0.45" />
      <circle cx="110" cy="232" r="1.8" fill="#fde68a" opacity="0.45" />

      {/* Arm */}
      <motion.g
        animate={raised
          ? { rotate: -75, x: -18, y: -44 }
          : { rotate:   0, x:   0, y:   0 }}
        style={{ transformOrigin: "148px 218px" }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <path d="M 148 218 Q 164 238, 160 263"
          stroke="#fde8d8" strokeWidth="22" strokeLinecap="round" fill="none" />
        <circle cx="160" cy="265" r="14" fill="#fde8d8" />
        <ellipse cx="150" cy="252" rx="6" ry="9" fill="#fde8d8"
          transform="rotate(-18, 150, 252)" />
        <ellipse cx="163" cy="250" rx="6" ry="9" fill="#fde8d8"
          transform="rotate(4, 163, 250)" />
        <ellipse cx="171" cy="257" rx="5" ry="8" fill="#fde8d8"
          transform="rotate(22, 171, 257)" />
      </motion.g>

      {hearts && <HeartBurst ox={100} oy={158}
        palette={["#f43f5e","#fb923c","#fbbf24","#f43f5e","#fb7185","#fde68a"]} />}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Ghibli face — Dua Lipa
   Oval face · dark bun · cat-eye liner · defined brows · chic dark outfit
───────────────────────────────────────────────────────────────────────────── */
function DuaFace({ phase }: { phase: Phase }) {
  const raised  = phase !== "enter";
  const kissing = ["kiss","hearts","rain","exit"].includes(phase);
  const hearts  = ["hearts","rain"].includes(phase);

  return (
    <svg viewBox="0 0 200 275" width="100%" style={{ maxHeight: "44vh" }}>

      {/* Hair back — sleek, dark */}
      <ellipse cx="100" cy="116" rx="74" ry="86" fill="#0e0604" />

      {/* Face — narrower, longer, more oval */}
      <ellipse cx="100" cy="126" rx="64" ry="84" fill="#f0cfa0" />

      {/* Hair sides — straight, sleek */}
      <path d="M 28 116 Q 22 152, 30 190 Q 40 194, 42 170 Q 36 145, 36 128 Q 30 122, 28 116 Z"
        fill="#0e0604" />
      <path d="M 172 116 Q 178 152, 170 190 Q 160 194, 158 170 Q 164 145, 164 128 Q 170 122, 172 116 Z"
        fill="#0e0604" />

      {/* Bun — elevated, polished */}
      <ellipse cx="100" cy="46"  rx="38" ry="36" fill="#0e0604" />
      <ellipse cx="100" cy="70"  rx="48" ry="26" fill="#0e0604" />
      {/* Bun sculpt highlight */}
      <ellipse cx="90"  cy="34"  rx="12" ry="8"  fill="#1c100a" opacity="0.55" />
      <ellipse cx="112" cy="40"  rx="8"  ry="5"  fill="#1c100a" opacity="0.40" />
      {/* Bun accessory — gold pin */}
      <ellipse cx="120" cy="44" rx="9" ry="3" fill="#c8921a" opacity="0.75" transform="rotate(-30 120 44)" />
      <circle  cx="124" cy="40" r="3"   fill="#e8b820" opacity="0.85" />

      {/* ── LEFT EYE — almond, cat-eye, dramatic ── */}
      <ellipse cx="72" cy="108" rx="23" ry="19" fill="white" />
      <ellipse cx="73" cy="111" rx="15" ry="15" fill="#3c6aaa" />
      <ellipse cx="73" cy="112" rx="9"  ry="10" fill="#060c1e" />
      <ellipse cx="79" cy="104" rx="5"  ry="5.5" fill="white" />
      <circle  cx="66" cy="111" r="2.5" fill="white" opacity="0.60" />
      {/* Liner — tight, defined */}
      <path d="M 50 100 Q 72 92, 95 100"
        stroke="#060408" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Cat-eye flick — right corner */}
      <path d="M 94 102 Q 100 96, 102 92"
        stroke="#060408" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Bold brow */}
      <path d="M 49 82 Q 70 72, 92 78"
        stroke="#0e0604" strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* ── RIGHT EYE — almond, cat-eye, dramatic ── */}
      <ellipse cx="128" cy="108" rx="23" ry="19" fill="white" />
      <ellipse cx="127" cy="111" rx="15" ry="15" fill="#3c6aaa" />
      <ellipse cx="127" cy="112" rx="9"  ry="10" fill="#060c1e" />
      <ellipse cx="133" cy="104" rx="5"  ry="5.5" fill="white" />
      <circle  cx="121" cy="111" r="2.5" fill="white" opacity="0.60" />
      <path d="M 105 100 Q 128 92, 150 100"
        stroke="#060408" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 106 102 Q 100 96, 98 92"
        stroke="#060408" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 108 82 Q 130 72, 151 78"
        stroke="#0e0604" strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* Nose — defined bridge */}
      <path d="M 98 130 L 96 142 Q 100 147, 104 142 L 102 130"
        fill="none" stroke="#b07848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 93 143 Q 100 148, 107 143"
        fill="none" stroke="#b07848" strokeWidth="1.8" strokeLinecap="round" />

      {/* Mouth */}
      {kissing
        ? <ellipse cx="100" cy="160" rx="10" ry="8" fill="#c02848" />
        : <>
            {/* Dua's signature fuller lip look */}
            <path d="M 82 157 Q 100 152, 118 157" fill="#c02848" />
            <path d="M 82 157 Q 100 171, 118 157"
              fill="none" stroke="#c02848" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 86 157 Q 100 154, 114 157"
              fill="none" stroke="#e8506c" strokeWidth="1.5" strokeLinecap="round" />
          </>
      }

      {/* Cheeks — sculpted, subtle (not round and rosy) */}
      <ellipse cx="62"  cy="138" rx="13" ry="8" fill="#c08060" opacity="0.18" />
      <ellipse cx="138" cy="138" rx="13" ry="8" fill="#c08060" opacity="0.18" />

      {/* Contour — defined cheekbones */}
      <path d="M 38 128 Q 52 142, 58 156" stroke="#c09060" strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round" />
      <path d="M 162 128 Q 148 142, 142 156" stroke="#c09060" strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round" />

      {/* Pearl earring — left */}
      <circle cx="37" cy="148" r="5" fill="white" opacity="0.85" />
      <circle cx="37" cy="148" r="3" fill="#f0e8ff" opacity="0.70" />

      {/* Pearl earring — right */}
      <circle cx="163" cy="148" r="5" fill="white" opacity="0.85" />
      <circle cx="163" cy="148" r="3" fill="#f0e8ff" opacity="0.70" />

      {/* Neck */}
      <rect x="85" y="206" width="30" height="32" rx="10" fill="#f0cfa0" />

      {/* Outfit — sleek dark with purple detail */}
      <path d="M 0 275 Q 36 210, 85 204 L 85 230 Q 46 242, 14 275 Z"  fill="#1a0438" />
      <path d="M 200 275 Q 164 210, 115 204 L 115 230 Q 154 242, 186 275 Z" fill="#1a0438" />
      <path d="M 85 230 Q 100 236, 115 230 L 115 204 Q 100 210, 85 204 Z"   fill="#110228" />
      {/* Deep-V neckline */}
      <path d="M 85 204 L 100 222 L 115 204" fill="none" stroke="#7c3aed" strokeWidth="1.8" />
      {/* Outfit shimmer */}
      <line x1="92" y1="240" x2="92" y2="252" stroke="#a855f7" strokeWidth="1" opacity="0.35" />
      <line x1="108" y1="240" x2="108" y2="252" stroke="#a855f7" strokeWidth="1" opacity="0.35" />

      {/* Arm */}
      <motion.g
        animate={raised
          ? { rotate: -75, x: -18, y: -44 }
          : { rotate:   0, x:   0, y:   0 }}
        style={{ transformOrigin: "148px 212px" }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <path d="M 148 212 Q 164 232, 160 257"
          stroke="#f0cfa0" strokeWidth="22" strokeLinecap="round" fill="none" />
        <circle cx="160" cy="259" r="14" fill="#f0cfa0" />
        <ellipse cx="150" cy="246" rx="6" ry="9" fill="#f0cfa0"
          transform="rotate(-18, 150, 246)" />
        <ellipse cx="163" cy="244" rx="6" ry="9" fill="#f0cfa0"
          transform="rotate(4, 163, 244)" />
        <ellipse cx="171" cy="251" rx="5" ry="8" fill="#f0cfa0"
          transform="rotate(22, 171, 251)" />
      </motion.g>

      {hearts && <HeartBurst ox={100} oy={160}
        palette={["#e879f9","#a855f7","#c084fc","#67e8f9","#f0abfc","#7dd3fc"]} />}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   The full scene
───────────────────────────────────────────────────────────────────────────── */
function EggScene({ isSabrina, onClose }: { isSabrina: boolean; onClose: () => void }) {
  const phase   = usePhase(onClose);
  const showRain = ["rain", "exit"].includes(phase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer overflow-hidden"
      style={{
        background: isSabrina
          ? "radial-gradient(ellipse at 50% 60%, #3b1a05 0%, #1c0900 50%, #000 100%)"
          : "radial-gradient(ellipse at 50% 55%, #1a0630 0%, #0d0118 50%, #000 100%)",
      }}
    >
      {/* Word rain — behind the card */}
      <AnimatePresence>
        {showRain && (
          <WordRain
            key="rain"
            word={isSabrina ? "ESPRESSO" : "LEVITATING"}
            color={isSabrina ? "#fde68a" : "#d8b4fe"}
            glow={isSabrina ? "#f59e0b" : "#a855f7"}
          />
        )}
      </AnimatePresence>

      {/* Character card */}
      <motion.div
        initial={{ scale: 0.08, y: 80, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.9,  y: -30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.08 }}
        className="relative flex flex-col items-center gap-2 w-full max-w-[280px] px-4 z-10"
      >
        {/* Artist label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] tracking-[0.5em] uppercase font-semibold"
          style={{ color: isSabrina ? "#fde68a99" : "#e9d5ff99" }}
        >
          {isSabrina ? "Sabrina Carpenter" : "Dua Lipa"}
        </motion.p>

        {/* Song title — Gilroy ExtraBold */}
        <motion.p
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 16 }}
          className="text-2xl md:text-3xl tracking-[0.2em]"
          style={{
            fontFamily: "'Gilroy', sans-serif",
            fontWeight: 800,
            fontStyle:  "italic",
            color:      isSabrina ? "#fde68a" : "#e9d5ff",
            textShadow: isSabrina
              ? "0 0 20px #f59e0b, 0 0 40px #d97706"
              : "0 0 20px #a855f7, 0 0 40px #7c3aed",
          }}
        >
          {isSabrina ? "☕ ESPRESSO" : "✦ LEVITATING"}
        </motion.p>

        {/* Face */}
        {isSabrina
          ? <SabrinaFace phase={phase} />
          : <DuaFace     phase={phase} />}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Export
───────────────────────────────────────────────────────────────────────────── */
export default function CelebEasterEgg({ slug }: { slug: string }) {
  const [open, setOpen] = useState(true);

  if (slug !== "sabrina-carpenter" && slug !== "dua-lipa") return null;

  return (
    <AnimatePresence>
      {open && (
        <EggScene
          isSabrina={slug === "sabrina-carpenter"}
          onClose={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
