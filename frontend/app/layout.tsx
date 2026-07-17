import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Manrope } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "@/components/Navbar";
import MobileNavbar from "@/components/MobileNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import CosmicBackground from "@/components/CosmicBackground";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://zodicogai.com"),
  title: "ZodicogAI | Explainable Compatibility and Relationship Intelligence",
  description: "ZodicogAI is a hybrid symbolic-generative system for compatibility, communication, and relationship intelligence — combining deterministic multi-framework profile modeling with grounded AI interpretation across zodiac, MBTI, numerology, attachment, love styles, and more.",
  keywords: "compatibility intelligence, relationship intelligence, behavioral intelligence, zodiac compatibility, MBTI relationships, numerology, love languages, attachment styles, hybrid AI system",
  openGraph: {
    title: "ZodicogAI | Explainable Compatibility and Relationship Intelligence",
    description: "A hybrid symbolic-generative system combining zodiac, MBTI, numerology, attachment, and love styles with structured AI interpretation for grounded compatibility and communication insights.",
    url: "https://zodicogai.com",
    siteName: "ZodicogAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZodicogAI | Explainable Compatibility and Relationship Intelligence",
    description: "Hybrid symbolic-generative compatibility intelligence — deterministic multi-framework profiling with grounded AI interpretation.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  other: {
    "google-site-verification": "ifMWF0ii4Xf5mX8CWKT3-Uh391y0cGWaGk5z86J4Goo",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.className} ${GeistMono.variable} ${manrope.variable}`}>
      <body className="bg-surface text-ink antialiased">

        <CosmicBackground />

        {/* Desktop navbar — hidden on mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile navbar — hidden on desktop */}
        <MobileNavbar />

        {/* Flex wrapper ensures footer always stays below content */}
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <PageTransition>
              <div className="pt-0 md:pt-16 pb-24 md:pb-0">{children}</div>
            </PageTransition>
          </div>

        <Footer />
        </div>{/* end flex wrapper */}
      </body>
      <GoogleAnalytics gaId="G-HY2R286L2X" />
    </html>
  );
}
