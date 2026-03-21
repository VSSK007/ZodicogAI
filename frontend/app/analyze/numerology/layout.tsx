import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numerology Analysis | ZodicogAI",
  description: "Calculate your life path number, expression number, and numerology compatibility score using Pythagorean numerology.",
  keywords: "numerology reading, life path number, numerology compatibility, expression number, Pythagorean numerology",
  openGraph: {
    title: "Numerology Analysis | ZodicogAI",
    description: "Calculate your life path number, expression number, and numerology compatibility score using Pythagorean numerology.",
    url: "https://zodicogai.com/analyze/numerology",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Numerology Analysis | ZodicogAI",
    description: "Calculate your life path number, expression number, and numerology compatibility score using Pythagorean numerology.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
