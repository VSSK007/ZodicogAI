"use client";

/**
 * StarCanvas - the ambient star field and drifting zodiac doodles, drawn on ONE
 * canvas instead of ~120 animated DOM nodes.
 *
 * Motion mirrors the CSS keyframes it replaces (twinkle, drift0-5) so the look
 * is unchanged, but the browser now lays out and animates a single element.
 * Redraws at ~20 fps, pauses while the tab is hidden, and draws one still
 * frame for visitors who prefer reduced motion.
 */
import { useEffect, useRef } from "react";
import { DOODLES, STARS } from "@/lib/cosmos";

const FRAME_MS = 50; // ~20 fps is plenty for slow ambient motion

/** Drift vectors (px at the animation midpoint) - the old drift0..drift5 keyframes. */
const DRIFT: [number, number][] = [
  [-18, -24], [24, -18], [20, 22], [-22, 20], [12, -30], [-28, 14],
];

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep ~ ease-in-out

const PATHS = DOODLES.map((d) => (typeof Path2D !== "undefined" ? new Path2D(d.path) : null));

export default function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(nowMs: number) {
      if (!ctx) return;
      const t = nowMs / 1000;
      ctx.clearRect(0, 0, width, height);

      // Stars: twinkle between 0.15 and 0.045, like the old CSS keyframe.
      for (const s of STARS) {
        const phase = (((t - s.twinkleDelay) / s.twinkleDur) % 1 + 1) % 1;
        const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        ctx.globalAlpha = 0.15 - 0.105 * ease(tri);
        ctx.fillStyle = s.gold ? "#edcb7e" : "#e9e6f5";
        ctx.beginPath();
        ctx.arc((s.x / 100) * width, (s.y / 100) * height, s.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Doodles: fade in, drift out to a midpoint and back, fade out.
      ctx.strokeStyle = "#ffffff";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      DOODLES.forEach((d, i) => {
        const path = PATHS[i];
        if (!path) return;
        const p = (((t - d.delay) / d.dur) % 1 + 1) % 1;
        let opacity: number;
        if (p < 0.15) opacity = 0.06 * ease(p / 0.15);
        else if (p < 0.5) opacity = 0.06 - 0.02 * ease((p - 0.15) / 0.35);
        else if (p < 0.85) opacity = 0.04 + 0.02 * ease((p - 0.5) / 0.35);
        else opacity = 0.06 * (1 - ease((p - 0.85) / 0.15));
        const travel = p < 0.5 ? ease(p / 0.5) : 1 - ease((p - 0.5) / 0.5);
        const [dx, dy] = DRIFT[d.dir];

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate((d.x / 100) * width + d.size / 2 + dx * travel, (d.y / 100) * height + d.size / 2 + dy * travel);
        ctx.rotate((d.rot * Math.PI) / 180);
        ctx.scale(d.size / 24, d.size / 24);
        ctx.translate(-12, -12);
        ctx.lineWidth = 0.9;
        ctx.stroke(path);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    resize();
    let raf = 0;
    let last = 0;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    }

    function start() {
      if (reduced || raf) return;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    draw(performance.now());
    start();

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="cosmic-layer fixed inset-x-0 top-0 h-lvh w-full -z-20 pointer-events-none"
    />
  );
}
