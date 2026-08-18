import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://propaar.netlify.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/#faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
