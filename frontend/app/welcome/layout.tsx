import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your profile | ZodicogAI",
  description: "Tell ZodicogAI your name, birthday and MBTI once, and every reading is pre-filled for you.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
