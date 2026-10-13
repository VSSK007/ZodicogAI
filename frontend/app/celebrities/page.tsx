import CelebrityExplorer from "@/components/CelebrityExplorer";
import CelebrityMatches from "@/components/CelebrityMatches";

export const metadata = {
  title: "Celebrity Zodiac Database | ZodicogAI",
  description:
    "Explore zodiac signs, life paths, and astrological profiles of 360 global celebrities — from Bollywood to Hollywood. Search by name or filter by sign.",
};

export default function CelebritiesPage() {
  return (
    <>
      <CelebrityMatches className="max-w-6xl mx-auto px-4 md:px-6 pt-8" />
      <CelebrityExplorer />
    </>
  );
}
