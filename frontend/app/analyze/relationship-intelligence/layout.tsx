import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Relationship Intelligence Report | ZodicogAI",
  description: "The most comprehensive relationship report — 10-dimensional synastry analysis covering romance, emotions, intimacy, love languages, and long-term potential.",
  keywords: "synastry report, full relationship analysis, couples compatibility report, relationship intelligence, zodiac MBTI synastry",
  openGraph: {
    title: "Full Relationship Intelligence Report | ZodicogAI",
    description: "The most comprehensive relationship report — 10-dimensional synastry analysis covering romance, emotions, intimacy, love languages, and long-term potential.",
    url: "https://zodicogai.com/analyze/relationship-intelligence",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Full Relationship Intelligence Report | ZodicogAI",
    description: "The most comprehensive relationship report — 10-dimensional synastry analysis covering romance, emotions, intimacy, love languages, and long-term potential.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
