import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zodicognac AI Relationship Coach | ZodicogAI",
  description: "Chat with Zodicognac — your private AI relationship coach for personalized advice on love, compatibility, communication, and attraction.",
  keywords: "AI relationship coach, love advice AI, zodiac chat, MBTI relationship advice, AI dating coach",
  openGraph: {
    title: "Zodicognac AI Relationship Coach | ZodicogAI",
    description: "Chat with Zodicognac — your private AI relationship coach for personalized advice on love, compatibility, communication, and attraction.",
    url: "https://zodicogai.com/chat",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zodicognac AI Relationship Coach | ZodicogAI",
    description: "Chat with Zodicognac — your private AI relationship coach for personalized advice on love, compatibility, communication, and attraction.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
