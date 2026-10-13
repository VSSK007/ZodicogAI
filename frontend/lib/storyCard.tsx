import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { MARK } from "@/components/ZodicogMark";

/**
 * Shared shell for the 9:16 story cards (1080 x 1920): brand header, ambient
 * glows, footer URL. Bodies live in the route handlers that use it
 * (/r/[id]/story-image, /story/daily, ...). Built with next/og, so the score
 * ring is a real SVG arc, not the OG card's circular badge.
 */
export const STORY = { width: 1080, height: 1920 };

export const SITE = "zodicogai.com";

const MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK.size} ${MARK.size}" fill="none">` +
  `<circle cx="${MARK.ring.cx}" cy="${MARK.ring.cy}" r="${MARK.ring.r}" stroke="white" stroke-width="${MARK.ring.strokeWidth}" stroke-opacity="0.6"/>` +
  `<circle cx="${MARK.jewel.cx}" cy="${MARK.jewel.cy}" r="${MARK.jewel.r}" fill="white" fill-opacity="0.7"/>` +
  `<path d="${MARK.z.d}" stroke="white" stroke-width="${MARK.z.strokeWidth}" stroke-linecap="square" stroke-linejoin="miter"/>` +
  `</svg>`;

const svgSrc = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** A score ring as an image: track + violet arc, `score` 0-100. */
export function ringSrc(score: number, color = "#a99bff"): string {
  const R = 210;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - Math.min(100, Math.max(0, score)) / 100);
  return svgSrc(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">` +
      `<circle cx="250" cy="250" r="${R}" stroke="rgba(255,255,255,0.08)" stroke-width="30"/>` +
      `<circle cx="250" cy="250" r="${R}" stroke="${color}" stroke-width="30" stroke-linecap="round" ` +
      `stroke-dasharray="${C}" stroke-dashoffset="${offset}" transform="rotate(-90 250 250)"/>` +
      `</svg>`,
  );
}

export function StoryFrame({ children, footer }: { children: ReactNode; footer: string }) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        backgroundColor: "#0b0a14", fontFamily: "sans-serif",
        position: "relative", overflow: "hidden", color: "#f0eff6",
      }}
    >
      <div style={{
        position: "absolute", top: -260, left: "50%", marginLeft: -520,
        width: 1040, height: 760, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(139,124,246,0.34) 0%, transparent 70%)", display: "flex",
      }} />
      <div style={{
        position: "absolute", bottom: -300, left: "50%", marginLeft: -600,
        width: 1200, height: 800, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(216,166,60,0.16) 0%, transparent 70%)", display: "flex",
      }} />

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 110 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgSrc(MARK_SVG)} width={64} height={64} alt="" />
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Zodicog<span style={{ color: "#a99bff" }}>AI</span>
        </div>
      </div>

      {children}

      <div style={{
        display: "flex", position: "absolute", bottom: 110,
        fontSize: 34, color: "rgba(240,239,246,0.55)", letterSpacing: "0.02em",
      }}>
        {footer}
      </div>
    </div>
  );
}

export function storyResponse(node: ReactNode): ImageResponse {
  return new ImageResponse(node as React.ReactElement, { ...STORY });
}

export function storyFallback(label = "ZodicogAI"): ImageResponse {
  return storyResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#0b0a14", color: "#f0eff6", fontSize: 64, fontFamily: "sans-serif",
    }}>
      {label}
    </div>,
  );
}
