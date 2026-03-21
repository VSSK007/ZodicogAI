import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Style Analysis | ZodicogAI",
  description: "Identify your love style — Eros, Storge, Pragma, Mania, Ludus, or Agape — and how it pairs with your partner through AI analysis.",
  keywords: "love style quiz, eros storge pragma, love type compatibility, relationship love style, MBTI love style",
  openGraph: {
    title: "Love Style Analysis | ZodicogAI",
    description: "Identify your love style — Eros, Storge, Pragma, Mania, Ludus, or Agape — and how it pairs with your partner through AI analysis.",
    url: "https://zodicogai.com/analyze/love-style",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Style Analysis | ZodicogAI",
    description: "Identify your love style — Eros, Storge, Pragma, Mania, Ludus, or Agape — and how it pairs with your partner through AI analysis.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
