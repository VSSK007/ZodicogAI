import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zodiac Sign Analysis | ZodicogAI",
  description: "Get your full zodiac profile — personality traits, love style, career, shadow self, and best compatibility matches powered by AI behavioral analysis.",
  keywords: "zodiac analysis, zodiac sign personality, astrology reading, zodiac compatibility, zodiac traits",
  openGraph: {
    title: "Zodiac Sign Analysis | ZodicogAI",
    description: "Get your full zodiac profile — personality traits, love style, career, shadow self, and best compatibility matches powered by AI behavioral analysis.",
    url: "https://zodicogai.com/analyze/zodiac",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zodiac Sign Analysis | ZodicogAI",
    description: "Get your full zodiac profile — personality traits, love style, career, shadow self, and best compatibility matches powered by AI behavioral analysis.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
