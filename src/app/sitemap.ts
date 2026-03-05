import type { MetadataRoute } from "next";

function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "https://vstudent.in";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/items`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rooms`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
