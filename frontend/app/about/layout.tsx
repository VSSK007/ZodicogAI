import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ZodicogAI — Our Story & Mission",
  description: "Learn the origin story of ZodicogAI, what Zodicog means, and our mission to bridge ancient astrology with modern behavioral intelligence.",
  keywords: "about ZodicogAI, Zodicog meaning, behavioral intelligence founder, zodiac MBTI platform",
  openGraph: {
    title: "About ZodicogAI",
    description: "The origin, philosophy, and mission behind ZodicogAI's behavioral intelligence engine.",
    url: "https://zodicogai.com/about",
    siteName: "ZodicogAI",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
