import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sextrology Analysis | ZodicogAI",
  description: "Explore intimate compatibility, sexual character, and long-term passion potential through zodiac and behavioral intelligence.",
  keywords: "sextrology, sexual compatibility, zodiac intimacy, MBTI intimacy, couple intimacy analysis",
  openGraph: {
    title: "Sextrology Analysis | ZodicogAI",
    description: "Explore intimate compatibility, sexual character, and long-term passion potential through zodiac and behavioral intelligence.",
    url: "https://zodicogai.com/analyze/sextrology",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sextrology Analysis | ZodicogAI",
    description: "Explore intimate compatibility, sexual character, and long-term passion potential through zodiac and behavioral intelligence.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
