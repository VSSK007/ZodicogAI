"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Phase sequencer
───────────────────────────────────────────────────────────────────────────── */
type Phase = "enter" | "raise" | "kiss" | "hearts" | "flicker" | "title" | "exit";

function usePhase(onDone: () => void): Phase {
  const [phase, setPhase] = useState<Phase>("enter");
  useEffect(() => {
    const seq: [Phase, number][] = [
      ["raise",   700],
      ["kiss",    1300],
      ["hearts",  1700],
      ["flicker", 2500],
      ["title",   3000],
      ["exit",    3800],
    ];
    const timers = seq.map(([p, t]) => setTimeout(() => setPhase(p), t));
    const close   = setTimeout(onDone, 4600);
    return () => [...timers, close].forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return phase;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Heart burst (SVG children)
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
   Ghibli face — Sabrina Carpenter
   Blonde wavy hair · blue eyes · pink outfit
───────────────────────────────────────────────────────────────────────────── */
function SabrinaFace({ phase }: { phase: Phase }) {
  const raised  = !["enter"].includes(phase);
  const kissing = ["kiss","hearts","flicker","title","exit"].includes(phase);
  const hearts  = ["hearts","flicker","title"].includes(phase);

  return (
    <svg viewBox="0 0 200 275" width="100%" style={{ maxHeight: "44vh" }}>

      {/* Hair back */}
      <path d="M 28 120 Q 30 28, 100 22 Q 170 28, 172 120 Q 163 35, 100 30 Q 37 35, 28 120 Z"
        fill="#b8880e" />

      {/* Face */}
      <ellipse cx="100" cy="128" rx="70" ry="80" fill="#fde8d8" />

      {/* Hair sides */}
      <path d="M 28 120 Q 22 155, 30 190 Q 40 176, 44 150 Q 38 130, 28 120 Z" fill="#c89514" />
      <path d="M 172 120 Q 178 155, 170 190 Q 160 176, 156 150 Q 162 130, 172 120 Z" fill="#c89514" />

      {/* Bangs */}
      <path d="M 44 80 Q 68 50, 100 46 Q 132 50, 156 80 Q 134 63, 100 60 Q 66 63, 44 80 Z"
        fill="#e8b820" />

      {/* ── LEFT EYE ── */}
      <ellipse cx="72" cy="110" rx="21" ry="23" fill="white" />
      <ellipse cx="72" cy="114" rx="15" ry="17" fill="#4a94cc" />
      <ellipse cx="72" cy="115" rx="9"  ry="11" fill="#0d1e30" />
      <ellipse cx="77" cy="107" rx="5"  ry="6"  fill="white" />
      <circle  cx="65" cy="114" r="2.5"          fill="white" opacity="0.65" />
      <path d="M 52 98 Q 72 90, 92 98"
        stroke="#180e08" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* ── RIGHT EYE ── */}
      <ellipse cx="128" cy="110" rx="21" ry="23" fill="white" />
      <ellipse cx="128" cy="114" rx="15" ry="17" fill="#4a94cc" />
      <ellipse cx="128" cy="115" rx="9"  ry="11" fill="#0d1e30" />
      <ellipse cx="133" cy="107" rx="5"  ry="6"  fill="white" />
      <circle  cx="121" cy="114" r="2.5"          fill="white" opacity="0.65" />
      <path d="M 108 98 Q 128 90, 148 98"
        stroke="#180e08" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <circle cx="96"  cy="140" r="2" fill="#d08868" />
      <circle cx="104" cy="140" r="2" fill="#d08868" />

      {/* Mouth */}
      {kissing
        ? <ellipse cx="100" cy="156" rx="9" ry="7" fill="#e04870" />
        : <path d="M 86 153 Q 100 164, 114 153"
            fill="none" stroke="#e04870" strokeWidth="2.8" strokeLinecap="round" />
      }

      {/* Cheeks */}
      <ellipse cx="58"  cy="138" rx="17" ry="10" fill="#f8a8a8" opacity="0.55" />
      <ellipse cx="142" cy="138" rx="17" ry="10" fill="#f8a8a8" opacity="0.55" />

      {/* Neck */}
      <rect x="84" y="206" width="32" height="30" rx="12" fill="#fde8d8" />

      {/* Dress */}
      <path d="M 0 275 Q 35 215, 84 204 L 84 232 Q 44 244, 12 275 Z"  fill="#f472b6" />
      <path d="M 200 275 Q 165 215, 116 204 L 116 232 Q 156 244, 188 275 Z" fill="#f472b6" />
      <path d="M 84 232 Q 100 238, 116 232 L 116 204 Q 100 210, 84 204 Z"   fill="#ec4899" />

      {/* Arm (raises to mouth) */}
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
        {/* Fingers */}
        <ellipse cx="150" cy="252" rx="6" ry="9" fill="#fde8d8"
          transform="rotate(-18, 150, 252)" />
        <ellipse cx="163" cy="250" rx="6" ry="9" fill="#fde8d8"
          transform="rotate(4, 163, 250)" />
        <ellipse cx="171" cy="257" rx="5" ry="8" fill="#fde8d8"
          transform="rotate(22, 171, 257)" />
      </motion.g>

      {/* Hearts */}
      {hearts && <HeartBurst ox={100} oy={156}
        palette={["#f43f5e","#fb923c","#fbbf24","#f43f5e","#fb7185","#fde68a"]} />}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Ghibli face — Dua Lipa
   Dark hair bun · blue eyes · signature defined brows · chic dark outfit
───────────────────────────────────────────────────────────────────────────── */
function DuaFace({ phase }: { phase: Phase }) {
  const raised  = !["enter"].includes(phase);
  const kissing = ["kiss","hearts","flicker","title","exit"].includes(phase);
  const hearts  = ["hearts","flicker","title"].includes(phase);

  return (
    <svg viewBox="0 0 200 275" width="100%" style={{ maxHeight: "44vh" }}>

      {/* Hair back */}
      <ellipse cx="100" cy="118" rx="76" ry="88" fill="#150a04" />

      {/* Face */}
      <ellipse cx="100" cy="122" rx="68" ry="78" fill="#f0cfa0" />

      {/* Bun */}
      <circle  cx="100" cy="42"  r="36" fill="#150a04" />
      <ellipse cx="100" cy="66"  rx="46" ry="24" fill="#150a04" />
      {/* Bun highlight */}
      <ellipse cx="92"  cy="30"  rx="10" ry="8"  fill="#2a1a0c" opacity="0.5" />

      {/* Hair sides */}
      <path d="M 26 118 Q 20 152, 28 186 Q 38 172, 42 148 Q 36 126, 26 118 Z" fill="#150a04" />
      <path d="M 174 118 Q 180 152, 172 186 Q 162 172, 158 148 Q 164 126, 174 118 Z" fill="#150a04" />

      {/* ── LEFT EYE ── */}
      <ellipse cx="72" cy="108" rx="21" ry="23" fill="white" />
      <ellipse cx="72" cy="112" rx="15" ry="17" fill="#4272b8" />
      <ellipse cx="72" cy="113" rx="9"  ry="11" fill="#080e20" />
      <ellipse cx="77" cy="105" rx="5"  ry="5.5" fill="white" />
      <circle  cx="65" cy="112" r="2.5"           fill="white" opacity="0.65" />
      <path d="M 50 94 Q 72 86, 94 94"
        stroke="#0a0808" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Brow (defined, Dua's signature) */}
      <path d="M 50 82 Q 72 74, 91 80"
        stroke="#150a04" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* ── RIGHT EYE ── */}
      <ellipse cx="128" cy="108" rx="21" ry="23" fill="white" />
      <ellipse cx="128" cy="112" rx="15" ry="17" fill="#4272b8" />
      <ellipse cx="128" cy="113" rx="9"  ry="11" fill="#080e20" />
      <ellipse cx="133" cy="105" rx="5"  ry="5.5" fill="white" />
      <circle  cx="121" cy="112" r="2.5"           fill="white" opacity="0.65" />
      <path d="M 106 94 Q 128 86, 150 94"
        stroke="#0a0808" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 109 82 Q 128 74, 150 80"
        stroke="#150a04" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M 96 137 Q 100 143, 104 137"
        fill="none" stroke="#c08060" strokeWidth="2" strokeLinecap="round" />

      {/* Mouth */}
      {kissing
        ? <ellipse cx="100" cy="158" rx="10" ry="8" fill="#c02848" />
        : <path d="M 83 155 Q 100 168, 117 155"
            fill="none" stroke="#c02848" strokeWidth="3" strokeLinecap="round" />
      }

      {/* Cheeks */}
      <ellipse cx="60"  cy="136" rx="14" ry="9" fill="#e09070" opacity="0.30" />
      <ellipse cx="140" cy="136" rx="14" ry="9" fill="#e09070" opacity="0.30" />

      {/* Neck */}
      <rect x="84" y="198" width="32" height="32" rx="12" fill="#f0cfa0" />

      {/* Outfit (dark/luxe) */}
      <path d="M 0 275 Q 36 212, 84 200 L 84 228 Q 46 240, 14 275 Z"  fill="#2e0764" />
      <path d="M 200 275 Q 164 212, 116 200 L 116 228 Q 154 240, 186 275 Z" fill="#2e0764" />
      <path d="M 84 228 Q 100 234, 116 228 L 116 200 Q 100 206, 84 200 Z"   fill="#1e0448" />
      {/* Collar detail */}
      <path d="M 84 200 Q 100 212, 116 200" fill="none" stroke="#7c3aed" strokeWidth="1.5" />

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

      {hearts && <HeartBurst ox={100} oy={158}
        palette={["#e879f9","#a855f7","#c084fc","#67e8f9","#f0abfc","#7dd3fc"]} />}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   The full scene
───────────────────────────────────────────────────────────────────────────── */
function EggScene({ isSabrina, onClose }: { isSabrina: boolean; onClose: () => void }) {
  const phase = usePhase(onClose);
  const showFlicker = phase === "flicker" || phase === "title";

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
      {/* Character card */}
      <motion.div
        initial={{ scale: 0.08, y: 80, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.9,  y: -30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.08 }}
        className="relative flex flex-col items-center gap-2 w-full max-w-[280px] px-4"
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] tracking-[0.5em] uppercase font-semibold"
          style={{ color: isSabrina ? "#fde68a99" : "#e9d5ff99" }}
        >
          {isSabrina ? "Sabrina Carpenter" : "Dua Lipa"}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 16 }}
          className="text-2xl md:text-3xl font-black tracking-[0.2em]"
          style={{
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

      {/* Screen flicker + title burst */}
      <AnimatePresence>
        {showFlicker && (
          <motion.div
            key="flicker"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1, 0.3, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, times: [0, 0.1, 0.25, 0.42, 0.6, 0.78, 1] }}
            style={{ backgroundColor: isSabrina ? "#3b1200" : "#1e0640" }}
          >
            <motion.p
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.1, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-[3rem] sm:text-[5rem] font-black tracking-[0.15em] text-center px-4"
              style={{
                color:      isSabrina ? "#fde68a" : "#e9d5ff",
                textShadow: isSabrina
                  ? "0 0 40px #f59e0b, 0 0 80px #d97706, 0 0 120px #b45309"
                  : "0 0 40px #a855f7, 0 0 80px #7c3aed, 0 0 120px #4c1d95",
              }}
            >
              {isSabrina ? "☕ ESPRESSO" : "✦ LEVITATING"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
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
