import "./globals.css";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import DeferredAnalytics from "@/components/DeferredAnalytics";
import ObservabilityProvider from "@/components/ObservabilityProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallProvider from "@/components/InstallProvider";
import Navbar from "@/components/Navbar";
import MobileNavbar from "@/components/MobileNavbar";
import AppTabBar from "@/components/AppTabBar";
import { ViewTransition } from "react";
import MotionProvider from "@/components/MotionProvider";
import CommandPalette from "@/components/CommandPalette";
import Footer from "@/components/Footer";
import CosmicBackground from "@/components/CosmicBackground";

// Mono is used only for small numerals/step numbers, so it is not preloaded:
// it loads when first needed instead of competing with the LCP resources.
const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

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
  applicationName: "ZodicogAI",
  appleWebApp: { capable: true, title: "ZodicogAI", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/pwa-icon-512", sizes: "512x512", type: "image/png" }],
  },
  other: {
    "google-site-verification": "ifMWF0ii4Xf5mX8CWKT3-Uh391y0cGWaGk5z86J4Goo",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.className} ${geistMono.variable} ${manrope.variable}`}>
      <head>
        {/* Before first paint: mark the installed app, a saved profile and a dismissed install banner so none of their chrome flashes or shifts in. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var h=document.documentElement;if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)h.dataset.installed='true';var p=JSON.parse(localStorage.getItem('zodicog.profile')||'null');if(p&&p.name&&p.day&&p.month)h.dataset.hasProfile='true';var d=Number(localStorage.getItem('zodicog.install.dismissed'));if(d&&Date.now()-d<2592000000)h.dataset.installDismissed='true'}catch(e){}",
          }}
        />
      </head>
      <body className="bg-surface text-ink antialiased">
        <MotionProvider>
        <CommandPalette />

        <CosmicBackground />

        {/* Desktop navbar — hidden on mobile */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Mobile navbar — hidden on desktop */}
        <MobileNavbar />
        <AppTabBar />

        {/* Flex wrapper ensures footer always stays below content */}
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <ViewTransition>
              <div className="pt-0 lg:pt-16 pb-24 lg:pb-0">{children}</div>
            </ViewTransition>
          </div>

        <Footer />
        </div>{/* end flex wrapper */}
        </MotionProvider>
      </body>
      <DeferredAnalytics gaId="G-HY2R286L2X" />
      <ObservabilityProvider />
      <ServiceWorkerRegister />
      <InstallProvider />
    </html>
  );
}
