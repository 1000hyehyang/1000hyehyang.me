import type { MetadataRoute } from "next";
import { getAllPortfolio } from "@/lib/mdx";
import { SITE_CONFIG } from "@/lib/config";
import { getPortfolioStartTime } from "@/lib/portfolio";

function toIso(value: string | Date): string {
  return new Date(value).toISOString();
}

function maxDate(...values: (string | Date)[]): Date {
  return values.reduce<Date>((latest, value) => {
    const current = new Date(value);
    return current > latest ? current : latest;
  }, new Date(0));
}

function getPortfolioDate(period: string): Date {
  const timestamp = getPortfolioStartTime(period);
  return timestamp > 0 ? new Date(timestamp) : new Date(0);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const portfolios = getAllPortfolio();
  const portfolioDates = portfolios.map((project) =>
    getPortfolioDate(project.period)
  );
  const latestContentUpdate = maxDate(...portfolioDates);

  const listPageLastModified =
    latestContentUpdate.getTime() > 0
      ? toIso(latestContentUpdate)
      : toIso(new Date());

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: listPageLastModified },
    { url: `${baseUrl}/portfolio`, lastModified: listPageLastModified },
    { url: `${baseUrl}/about`, lastModified: listPageLastModified },
  ];

  const portfolioPages: MetadataRoute.Sitemap = portfolios.map((project) => ({
    url: `${baseUrl}/portfolio/${project.category}/${project.slug}`,
    lastModified: toIso(getPortfolioDate(project.period)),
  }));

  return [...staticPages, ...portfolioPages];
}
