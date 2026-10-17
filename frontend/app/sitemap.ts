import { MetadataRoute } from "next";
import { ALL_COMBOS, comboPath } from "@/lib/combos";
import { listedComparePaths } from "@/lib/couples";

const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const MBTI_TYPES = ["intj","intp","entj","entp","infj","infp","enfj","enfp","istj","isfj","estj","esfj","istp","isfp","estp","esfp"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://zodicogai.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/horoscope`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/analyze/zodiac`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/romantic`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/emotional`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/hybrid`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/sextrology`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/love-style`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/love-language`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/group`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/color`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/numerology`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/chat`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/types`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/celebrities/compare`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    // Only owner-approved, documented pairs (lib/couples.ts, empty by default); every other pair is noindex.
    ...listedComparePaths().map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...ALL_COMBOS.map((c) => ({ url: `${base}${comboPath(c.sign, c.mbti)}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...SIGNS.map(s => ({ url: `${base}/blog/zodiac/${s}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...MBTI_TYPES.map(t => ({ url: `${base}/blog/mbti/${t}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...SIGNS.map(s => ({ url: `${base}/horoscope/${s}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
