import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Chemistry | ZodicogAI",
  description:
    "Add 3 to 8 people and see who clicks, who clashes and who holds the group together: every pair scored by deterministic engines.",
  keywords: "group compatibility, friend group zodiac, group chemistry, zodiac group compatibility, MBTI group",
  openGraph: {
    title: "Group Chemistry | ZodicogAI",
    description: "Who clicks, who clashes and who holds the group together.",
    url: "https://zodicogai.com/analyze/group",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Group Chemistry | ZodicogAI",
    description: "Who clicks, who clashes and who holds the group together.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
