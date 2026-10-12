import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your day | ZodicogAI",
  description: "Your personal daily card: horoscope, MBTI tip, lucky colour and number, and what to do and avoid today.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
