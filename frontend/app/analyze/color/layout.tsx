import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aura Color Reading | ZodicogAI",
  description: "Discover your spiritual aura color, power color, and 2026 cosmic alignment based on your zodiac sign and birth date.",
  keywords: "aura color reading, zodiac aura, spiritual color, aura meaning, zodiac color personality",
  openGraph: {
    title: "Aura Color Reading | ZodicogAI",
    description: "Discover your spiritual aura color, power color, and 2026 cosmic alignment based on your zodiac sign and birth date.",
    url: "https://zodicogai.com/analyze/color",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Color Reading | ZodicogAI",
    description: "Discover your spiritual aura color, power color, and 2026 cosmic alignment based on your zodiac sign and birth date.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
