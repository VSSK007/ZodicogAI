"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Espresso character (Sabrina Carpenter) ───────────────────────────────── */
function EspressoScene() {
  return (
    <div className="flex flex-col items-center gap-4 select-none w-full px-6">

      <motion.p
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ color: "#fde68a", textShadow: "0 0 20px #f59e0b" }}
        className="text-xs tracking-[0.5em] uppercase font-semibold"
      >
        Sabrina Carpenter
      </motion.p>

      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.05 }}
        className="text-5xl font-black tracking-widest"
        style={{ color: "#fde68a", textShadow: "0 0 32px #f59e0b, 0 0 64px #d97706" }}
      >
        ☕ ESPRESSO
      </motion.p>

      {/* Cup character — fills width */}
      <motion.div
        className="w-full max-w-[320px]"
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.2 }}
      >
        <svg viewBox="0 0 280 310" width="100%" height="auto">

          {/* Saucer */}
          <motion.ellipse cx="140" cy="285" rx="90" ry="14"
            fill="#92400e"
            animate={{ scaleX: [1, 1.08, 1], scaleY: [1, 0.88, 1] }}
            style={{ transformOrigin: "140px 285px" }}
            transition={{ duration: 0.5, delay: 1.0, repeat: Infinity, repeatDelay: 2.2 }}
          />
          <ellipse cx="140" cy="281" rx="78" ry="10" fill="#b45309" opacity="0.5" />

          {/* Cup — bounces */}
          <motion.g
            animate={{
              y:      [0, -40, 0, -18, 0, -7, 0],
              scaleY: [1, 1.08, 0.86, 1.05, 0.96, 1.02, 1],
              scaleX: [1, 0.93, 1.1,  0.97, 1.02, 0.99, 1],
            }}
            style={{ transformOrigin: "140px 270px" }}
            transition={{ duration: 1.5, delay: 0.9, repeat: Infinity, repeatDelay: 2.0, ease: "easeOut" }}
          >
            {/* Body */}
            <path d="M68 138 L76 255 L204 255 L212 138 Z"
              fill="#1c0800" stroke="#f59e0b" strokeWidth="3" />
            {/* Handle */}
            <path d="M204 160 Q248 172 248 195 Q248 218 204 210"
              fill="none" stroke="#f59e0b" strokeWidth="5.5" strokeLinecap="round" />
            {/* Coffee surface */}
            <ellipse cx="140" cy="141" rx="68" ry="12" fill="#3b1200" />
            <ellipse cx="140" cy="141" rx="52" ry="8"  fill="#b45309" opacity="0.6" />
            <ellipse cx="140" cy="141" rx="30" ry="5"  fill="#d97706" opacity="0.3" />
            {/* Rim */}
            <ellipse cx="140" cy="138" rx="69" ry="13" fill="none" stroke="#f59e0b" strokeWidth="3" />

            {/* Eyes */}
            <motion.ellipse cx="118" cy="190" rx="9" ry="9" fill="#fde68a"
              animate={{ ry: [9, 1, 9] }}
              transition={{ duration: 0.14, delay: 2.8, repeat: Infinity, repeatDelay: 3.4 }}
            />
            <motion.ellipse cx="162" cy="190" rx="9" ry="9" fill="#fde68a"
              animate={{ ry: [9, 1, 9] }}
              transition={{ duration: 0.14, delay: 2.8, repeat: Infinity, repeatDelay: 3.4 }}
            />
            <circle cx="121" cy="192" r="4.5" fill="#1c0800" />
            <circle cx="165" cy="192" r="4.5" fill="#1c0800" />
            {/* Eye shine */}
            <circle cx="123" cy="189" r="2" fill="#fff" opacity="0.6" />
            <circle cx="167" cy="189" r="2" fill="#fff" opacity="0.6" />

            {/* Smile */}
            <path d="M120 218 Q140 232 160 218"
              fill="none" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round" />

            {/* Cheeks */}
            <ellipse cx="100" cy="208" rx="12" ry="8" fill="#f87171" opacity="0.4" />
            <ellipse cx="180" cy="208" rx="12" ry="8" fill="#f87171" opacity="0.4" />
          </motion.g>

          {/* Steam */}
          {[
            "M 110 128 C 102 108, 118 90, 110 70",
            "M 140 124 C 148 104, 132 86, 140 66",
            "M 170 128 C 178 108, 162 90, 170 70",
          ].map((d, i) => (
            <motion.path key={i} d={d}
              fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 1, 0], y: [0, -22] }}
              transition={{ duration: 1.9, delay: i * 0.52, repeat: Infinity, repeatDelay: 0.2, ease: "easeInOut" }}
            />
          ))}

          {/* Sparkles */}
          {[[30,100],[242,95],[22,210],[252,215],[136,48],[62,268],[218,272]].map(([x,y],i) => (
            <motion.text key={i} x={x} y={y} fontSize={12+(i%3)*5}
              fill="#fbbf24" textAnchor="middle"
              animate={{ opacity:[0,1,0], scale:[0.2,1.6,0.2] }}
              style={{ transformOrigin:`${x}px ${y}px` }}
              transition={{ duration:1.4, delay:i*0.3, repeat:Infinity, repeatDelay:0.8 }}
            >✦</motion.text>
          ))}
        </svg>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-[10px] tracking-[0.4em] uppercase"
        style={{ color: "#fbbf2455" }}
      >
        tap to close
      </motion.p>
    </div>
  );
}

/* ─── Levitating character (Dua Lipa) ──────────────────────────────────────── */
function LevitatingScene() {
  return (
    <div className="flex flex-col items-center gap-4 select-none w-full px-6">

      <motion.p
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ color: "#e9d5ff", textShadow: "0 0 20px #a855f7" }}
        className="text-xs tracking-[0.5em] uppercase font-semibold"
      >
        Dua Lipa
      </motion.p>

      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.05 }}
        className="text-5xl font-black tracking-widest"
        style={{ color: "#e9d5ff", textShadow: "0 0 32px #a855f7, 0 0 64px #7c3aed" }}
      >
        ✦ LEVITATING
      </motion.p>

      {/* Orb character */}
      <motion.div
        className="w-full max-w-[320px]"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.2 }}
      >
        <svg viewBox="0 0 280 310" width="100%" height="auto">

          {/* Ground shadow — shrinks as orb floats */}
          <motion.ellipse cx="140" cy="288" rx="52" ry="9"
            fill="#000" opacity="0.35"
            animate={{ rx: [52, 28, 52], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Outer rings */}
          {[100, 80, 62].map((r, i) => (
            <motion.circle key={i} cx="140" cy="150" r={r}
              fill="none"
              stroke={["#2e1065","#5b21b6","#8b5cf6"][i]}
              strokeWidth={[1.5, 2, 2.5][i]}
              animate={{ y:[0,-22,0], opacity:[0.35,0.7,0.35], scale:[0.94,1.07,0.94] }}
              style={{ transformOrigin:"140px 150px" }}
              transition={{ duration:2.8, delay:i*0.3, repeat:Infinity, ease:"easeInOut" }}
            />
          ))}

          {/* Orb body layers */}
          {[
            { r: 44, fill: "#3b0764" },
            { r: 34, fill: "#6d28d9" },
            { r: 22, fill: "#a855f7" },
            { r: 10, fill: "#f3e8ff" },
          ].map(({ r, fill }, i) => (
            <motion.circle key={i} cx="140" cy="150" r={r}
              fill={fill}
              animate={{ y:[0,-22,0], scale: i===2 ? [1,1.08,1] : [1,1,1] }}
              style={{ transformOrigin:"140px 150px" }}
              transition={{ duration:2.8, delay:i*0.05, repeat:Infinity, ease:"easeInOut" }}
            />
          ))}

          {/* Face */}
          {/* Eyes */}
          <motion.ellipse cx="128" cy="143" rx="7" ry="7" fill="#e9d5ff"
            animate={{ y:[0,-22,0], ry:[7,1,7] }}
            style={{ transformOrigin:"128px 143px" }}
            transition={{
              y: { duration:2.8, repeat:Infinity, ease:"easeInOut" },
              ry:{ duration:0.13, delay:3.2, repeat:Infinity, repeatDelay:3.6 },
            }}
          />
          <motion.ellipse cx="152" cy="143" rx="7" ry="7" fill="#e9d5ff"
            animate={{ y:[0,-22,0], ry:[7,1,7] }}
            style={{ transformOrigin:"152px 143px" }}
            transition={{
              y: { duration:2.8, repeat:Infinity, ease:"easeInOut" },
              ry:{ duration:0.13, delay:3.2, repeat:Infinity, repeatDelay:3.6 },
            }}
          />
          <motion.circle cx="130" cy="145" r="3.5" fill="#3b0764"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          <motion.circle cx="154" cy="145" r="3.5" fill="#3b0764"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          {/* Eye shine */}
          <motion.circle cx="132" cy="141" r="2" fill="#fff" opacity="0.7"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          <motion.circle cx="156" cy="141" r="2" fill="#fff" opacity="0.7"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          {/* Smile */}
          <motion.path d="M128 163 Q140 173 152 163"
            fill="none" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          {/* Cheeks */}
          <motion.ellipse cx="117" cy="158" rx="9" ry="6" fill="#f0abfc" opacity="0.45"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />
          <motion.ellipse cx="163" cy="158" rx="9" ry="6" fill="#f0abfc" opacity="0.45"
            animate={{ y:[0,-22,0] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }} />

          {/* Orbiting stars */}
          {[0,60,120,180,240,300].map((deg,i) => {
            const rad = (deg*Math.PI)/180;
            const ox = 140+Math.cos(rad)*88;
            const oy = 150+Math.sin(rad)*88;
            return (
              <motion.text key={i} x={ox} y={oy}
                fontSize={10+(i%2)*6} fill={i%2===0?"#f0abfc":"#67e8f9"}
                textAnchor="middle"
                animate={{ rotate:360, y:[oy,oy-22,oy], opacity:[0.5,1,0.5] }}
                style={{ transformOrigin:"140px 150px" }}
                transition={{
                  rotate:{ duration:7+i*0.5, repeat:Infinity, ease:"linear" },
                  y:{ duration:2.8, repeat:Infinity, ease:"easeInOut" },
                  opacity:{ duration:1.8, delay:i*0.28, repeat:Infinity },
                }}
              >{i%3===0?"✦":i%3===1?"✷":"✸"}</motion.text>
            );
          })}

          {/* Background sparkles */}
          {[[28,70],[242,80],[18,240],[250,238],[136,34],[55,280],[225,275]].map(([x,y],i) => (
            <motion.text key={i} x={x} y={y} fontSize={10+(i%3)*5}
              fill={i%2===0?"#c084fc":"#38bdf8"} textAnchor="middle"
              animate={{ opacity:[0,1,0], scale:[0.2,1.6,0.2] }}
              style={{ transformOrigin:`${x}px ${y}px` }}
              transition={{ duration:1.5, delay:i*0.3, repeat:Infinity, repeatDelay:0.9 }}
            >✦</motion.text>
          ))}
        </svg>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-[10px] tracking-[0.4em] uppercase"
        style={{ color: "#a855f755" }}
      >
        tap to close
      </motion.p>
    </div>
  );
}

/* ─── Export ────────────────────────────────────────────────────────────────── */

export default function CelebEasterEgg({ slug }: { slug: string }) {
  const [open, setOpen] = useState(true); // auto-open on mount

  if (slug !== "sabrina-carpenter" && slug !== "dua-lipa") return null;

  const isSabrina = slug === "sabrina-carpenter";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="egg-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          onAnimationComplete={() => {
            // auto-dismiss after 5s
            setTimeout(() => setOpen(false), 5000);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: isSabrina
              ? "radial-gradient(ellipse at 50% 55%, #3b1a05 0%, #1c0900 45%, #000 100%)"
              : "radial-gradient(ellipse at 50% 50%, #2e0b5e 0%, #0d0129 45%, #000 100%)",
          }}
        >
          <motion.div
            className="w-full max-w-sm"
            initial={{ scale: 0.1, opacity: 0, y: 80 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.1, opacity: 0, y: 80 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
          >
            {isSabrina ? <EspressoScene /> : <LevitatingScene />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
