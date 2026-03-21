import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Synastry Report | ZodicogAI",
  description: "View your full synastry compatibility report — scores, trait radar, behavioral map, and AI-generated relationship insights.",
  keywords: "synastry compatibility, relationship report, zodiac MBTI synastry, compatibility score",
  openGraph: {
    title: "Synastry Report | ZodicogAI",
    description: "View your full synastry compatibility report — scores, trait radar, behavioral map, and AI-generated relationship insights.",
    url: "https://zodicogai.com/dashboard",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synastry Report | ZodicogAI",
    description: "View your full synastry compatibility report — scores, trait radar, behavioral map, and AI-generated relationship insights.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
