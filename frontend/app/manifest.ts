import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ZodicogAI — Explainable Compatibility & Relationship Intelligence",
    short_name: "ZodicogAI",
    description: "Deterministic engines score every framework; AI explains the result.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0a14",
    theme_color: "#0b0a14",
    categories: ["lifestyle", "entertainment", "social"],
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the installed icon for these.
    shortcuts: [
      { name: "Ask Zodicognac", short_name: "Zodicognac", url: "/chat", description: "Chat with Zodicognac" },
      { name: "Daily horoscope", short_name: "Horoscope", url: "/horoscope" },
      { name: "Full synastry report", short_name: "Report", url: "/dashboard" },
    ],
    // Enables the richer install sheet on Android/desktop Chrome.
    screenshots: [
      { src: "/screenshots/home-wide.png", sizes: "1280x720", type: "image/png", form_factor: "wide", label: "Compatibility, written in the stars" },
      { src: "/screenshots/home-narrow.png", sizes: "720x1280", type: "image/png", form_factor: "narrow", label: "Your reading on your phone" },
    ],
  };
}
