import { ImageResponse } from "next/og";

/**
 * Shared renderer for the PWA home-screen icon (see the app/pwa-icon-192,
 * app/pwa-icon-512, and app/pwa-icon-maskable route handlers).
 *
 * The mark is the real logo: the same SVG geometry as app/icon.svg (the
 * favicon) and components/ZodicogMark.tsx - ring, crown jewel, square-cap Z -
 * embedded as an SVG image so it can never drift from the site's logo.
 * Keep MARK in sync with app/icon.svg.
 *
 * maskable=true shrinks the mark so Android's maskable-icon crop (which can
 * clip up to ~20% per edge) never cuts it off.
 */
const BG = "#0a0a12"; // same as app/icon.svg

// viewBox is cropped to the ring plus the crown jewel, with a little air so scaling is predictable.
const MARK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 0.5 31 31" fill="none">' +
  '<circle cx="16" cy="16" r="13" stroke="white" stroke-width="0.85" stroke-opacity="0.45"/>' +
  '<circle cx="16" cy="3" r="1.4" fill="white" fill-opacity="0.55"/>' +
  '<path d="M8.5 11.5 H23.5 L8.5 20.5 H23.5" stroke="white" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/>' +
  "</svg>";

const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;

export function renderPwaIcon(size: number, maskable = false) {
  const markSize = Math.round(size * (maskable ? 0.68 : 0.86));

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
