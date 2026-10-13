import { ImageResponse } from "next/og";
import { MARK } from "@/components/ZodicogMark";

/**
 * Shared renderer for the PWA home-screen icon (see the app/pwa-icon-192,
 * app/pwa-icon-512, and app/pwa-icon-maskable route handlers).
 *
 * The mark is drawn from MARK in components/ZodicogMark.tsx - the very numbers
 * the site's footer and navbar logo use - and embedded as an SVG image, so the
 * installed app's icon is the same logo as the website's.
 *
 * maskable=true shrinks the mark so Android's maskable-icon crop (which can
 * clip up to ~20% per edge) never cuts it off.
 */
const BG = "#0b0a14"; // the site's surface colour (manifest background_color)

const MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK.size} ${MARK.size}" fill="none">` +
  `<circle cx="${MARK.ring.cx}" cy="${MARK.ring.cy}" r="${MARK.ring.r}" stroke="white" ` +
  `stroke-width="${MARK.ring.strokeWidth}" stroke-opacity="${MARK.ring.opacity}"/>` +
  `<circle cx="${MARK.jewel.cx}" cy="${MARK.jewel.cy}" r="${MARK.jewel.r}" fill="white" fill-opacity="${MARK.jewel.opacity}"/>` +
  `<path d="${MARK.z.d}" stroke="white" stroke-width="${MARK.z.strokeWidth}" stroke-linecap="square" stroke-linejoin="miter"/>` +
  `</svg>`;

const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

export function renderPwaIcon(size: number, maskable = false) {
  const markSize = Math.round(size * (maskable ? 0.62 : 0.8));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: BG,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_SRC} width={markSize} height={markSize} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}
