import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Celebrities: Zodiac Compatibility | ZodicogAI",
  description:
    "Pick any two of 360 public figures and see how their sun signs and numerology numbers line up. A zodiac and numerology comparison, nothing more.",
  alternates: { canonical: "https://zodicogai.com/celebrities/compare" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
