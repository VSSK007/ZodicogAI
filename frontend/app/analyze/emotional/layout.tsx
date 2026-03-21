import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emotional Compatibility | ZodicogAI",
  description: "Discover your emotional bond depth, conflict resolution style, and empathy resonance with your partner using AI behavioral analysis.",
  keywords: "emotional compatibility, relationship emotional intelligence, empathy score, conflict style, MBTI emotional match",
  openGraph: {
    title: "Emotional Compatibility | ZodicogAI",
    description: "Discover your emotional bond depth, conflict resolution style, and empathy resonance with your partner using AI behavioral analysis.",
    url: "https://zodicogai.com/analyze/emotional",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotional Compatibility | ZodicogAI",
    description: "Discover your emotional bond depth, conflict resolution style, and empathy resonance with your partner using AI behavioral analysis.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
