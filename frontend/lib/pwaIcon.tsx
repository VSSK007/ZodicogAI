import { ImageResponse } from "next/og";

/**
 * Shared renderer for the PWA home-screen icon (see the app/pwa-icon-192,
 * app/pwa-icon-512, and app/pwa-icon-maskable route handlers).
 * Same seal as ZodicogMark — ring + crown jewel + Z — rebuilt in the
 * div/border subset next/og's renderer (Satori) reliably supports, matching
 * the pattern already proven in the opengraph-image routes (text + borders +
 * radial-gradient backgrounds, no inline <svg> paths).
 *
 * maskable=true shrinks the mark into ~70% of the canvas so Android's
 * maskable-icon crop (which can clip up to ~20% per edge) never cuts it off.
 */
export function renderPwaIcon(size: number, maskable = false) {
  const scale = maskable ? 0.68 : 0.86;
  const markSize = Math.round(size * scale);
  const ringWidth = Math.max(2, Math.round(markSize * 0.03));
  const zThickness = Math.max(3, Math.round(markSize * 0.09));
  const zWidth = Math.round(markSize * 0.46);
  const zHeight = Math.round(markSize * 0.32);
  const jewelSize = Math.max(4, Math.round(markSize * 0.045));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#0b0a14",
          backgroundImage:
            "radial-gradient(circle at 50% 8%, rgba(139,124,246,0.32) 0%, transparent 62%)," +
            "radial-gradient(circle at 50% 100%, rgba(216,166,60,0.12) 0%, transparent 65%)",
        }}
      >
        {/* Ring */}
        <div
          style={{
            width: markSize, height: markSize, borderRadius: "50%",
            border: `${ringWidth}px solid rgba(255,255,255,0.4)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Crown jewel */}
          <div
            style={{
              position: "absolute", top: -jewelSize / 2, left: "50%",
              marginLeft: -jewelSize / 2,
              width: jewelSize, height: jewelSize, borderRadius: "50%",
              backgroundColor: "#edcb7e", display: "flex",
            }}
          />

          {/* Z — three bars, matching the square-cap letterform's proportions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: zWidth, height: zHeight, justifyContent: "space-between" }}>
            <div style={{ width: zWidth, height: zThickness, backgroundColor: "#f0eff6", display: "flex" }} />
            <div
              style={{
                width: Math.round(zWidth * 1.28), height: zThickness,
                backgroundColor: "#f0eff6", display: "flex",
                transform: `rotate(${-Math.atan2(zHeight, zWidth) * (180 / Math.PI)}deg)`,
              }}
            />
            <div style={{ width: zWidth, height: zThickness, backgroundColor: "#f0eff6", display: "flex" }} />
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
