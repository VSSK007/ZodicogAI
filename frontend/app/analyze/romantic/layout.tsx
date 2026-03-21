import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Romantic Compatibility | ZodicogAI",
  description: "AI-powered romantic compatibility analysis combining zodiac and MBTI. Score your attachment style, affection expression, and romantic polarity with any partner.",
  keywords: "romantic compatibility, zodiac love compatibility, MBTI romance, relationship score, couple compatibility",
  openGraph: {
    title: "Romantic Compatibility | ZodicogAI",
    description: "AI-powered romantic compatibility analysis combining zodiac and MBTI. Score your attachment style, affection expression, and romantic polarity with any partner.",
    url: "https://zodicogai.com/analyze/romantic",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Romantic Compatibility | ZodicogAI",
    description: "AI-powered romantic compatibility analysis combining zodiac and MBTI. Score your attachment style, affection expression, and romantic polarity with any partner.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
