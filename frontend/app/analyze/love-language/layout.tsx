import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Language Compatibility | ZodicogAI",
  description: "Find your primary love languages and how well they align with your partner — words, touch, acts, gifts, or quality time.",
  keywords: "love language quiz, love language compatibility, 5 love languages, partner love language match",
  openGraph: {
    title: "Love Language Compatibility | ZodicogAI",
    description: "Find your primary love languages and how well they align with your partner — words, touch, acts, gifts, or quality time.",
    url: "https://zodicogai.com/analyze/love-language",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Language Compatibility | ZodicogAI",
    description: "Find your primary love languages and how well they align with your partner — words, touch, acts, gifts, or quality time.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
