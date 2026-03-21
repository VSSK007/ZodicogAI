import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://zodicogai.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/analyze/zodiac`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/romantic`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/emotional`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/relationship-intelligence`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/analyze/hybrid`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/sextrology`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/love-style`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/love-language`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/color`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/analyze/numerology`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/chat`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
