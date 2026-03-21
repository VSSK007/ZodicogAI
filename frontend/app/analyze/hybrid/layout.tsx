import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self Analysis | ZodicogAI",
  description: "Get your complete behavioral profile — zodiac traits, MBTI type, emotional patterns, and love map — in one AI-powered self-analysis.",
  keywords: "personality analysis, zodiac MBTI profile, behavioral intelligence, self analysis, personality type",
  openGraph: {
    title: "Self Analysis | ZodicogAI",
    description: "Get your complete behavioral profile — zodiac traits, MBTI type, emotional patterns, and love map — in one AI-powered self-analysis.",
    url: "https://zodicogai.com/analyze/hybrid",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Self Analysis | ZodicogAI",
    description: "Get your complete behavioral profile — zodiac traits, MBTI type, emotional patterns, and love map — in one AI-powered self-analysis.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
