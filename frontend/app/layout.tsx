import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ZodicogAI",
  description: "Behavioral Intelligence Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-black text-white antialiased">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
        <Navbar />
        <div className="pt-12">{children}</div>
      </body>
    </html>
  );
}
