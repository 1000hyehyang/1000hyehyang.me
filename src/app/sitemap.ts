import { getAllPortfolio } from "@/lib/mdx";
import { SITE_CONFIG } from "@/lib/config";

export default async function sitemap() {
  const baseUrl = SITE_CONFIG.url;
  const portfolios = getAllPortfolio();

  const urls = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/blog`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/portfolio`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString() },
    ...portfolios.map(p => ({
      url: `${baseUrl}/portfolio/projects/${p.slug}`,
      lastModified: new Date().toISOString(),
    })),
  ];

  return urls;
} 