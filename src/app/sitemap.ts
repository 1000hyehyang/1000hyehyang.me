import type { MetadataRoute } from "next";
import { getAllPortfolio } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolios = getAllPortfolio();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/portfolio") },
  ];

  const portfolioPages: MetadataRoute.Sitemap = portfolios.map((project) => ({
    url: absoluteUrl(`/portfolio/${project.category}/${project.slug}`),
    images: project.images?.map(absoluteUrl),
  }));

  return [...staticPages, ...portfolioPages];
}
