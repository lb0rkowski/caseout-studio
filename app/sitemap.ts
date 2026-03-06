import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://caseoutstudio.pl";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: base + "/oferta", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: base + "/cennik", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: base + "/beaty", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/rezerwacje", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/kontakt", lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}
