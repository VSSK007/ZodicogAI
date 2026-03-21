/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://zodicogai.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      "https://zodicogai.com/sitemap.xml",
    ],
  },
  additionalPaths: async () => [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/analyze/zodiac", priority: 0.9, changefreq: "weekly" },
    { loc: "/analyze/romantic", priority: 0.9, changefreq: "weekly" },
    { loc: "/analyze/emotional", priority: 0.9, changefreq: "weekly" },
    { loc: "/analyze/sextrology", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/love-style", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/love-language", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/hybrid", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/color", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/numerology", priority: 0.8, changefreq: "weekly" },
    { loc: "/analyze/relationship-intelligence", priority: 0.9, changefreq: "weekly" },
    { loc: "/chat", priority: 0.7, changefreq: "monthly" },
  ],
};
