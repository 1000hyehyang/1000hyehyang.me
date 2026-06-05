import type { MetadataRoute } from "next";
import { getAllPortfolio } from "@/lib/mdx";
import { getAllBlogPosts, getPinnedPosts } from "@/lib/github";
import { SITE_CONFIG } from "@/lib/config";

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
  const start = period.split(" - ")[0]?.trim();
  const parsed = new Date(start);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const portfolios = getAllPortfolio();
  const [blogPosts, pinnedPosts] = await Promise.all([
    getAllBlogPosts(),
    getPinnedPosts(),
  ]);

  const blogUrlMap = new Map<string, string>();

  const registerBlogPost = (slug: string, date: string, updatedAt?: string) => {
    const url = `${baseUrl}/blog/${slug}`;
    const candidate = toIso(updatedAt || date);
    const existing = blogUrlMap.get(url);
    if (!existing || new Date(candidate) > new Date(existing)) {
      blogUrlMap.set(url, candidate);
    }
  };

  blogPosts.forEach((post) =>
    registerBlogPost(post.slug, post.date, post.updatedAt)
  );
  pinnedPosts.forEach((post) =>
    registerBlogPost(post.slug, post.date, post.updatedAt)
  );

  const blogDates = blogPosts.map((post) => post.updatedAt || post.date);
  const portfolioDates = portfolios.map((project) => getPortfolioDate(project.period));
  const latestContentUpdate = maxDate(...blogDates, ...portfolioDates);

  const listPageLastModified =
    latestContentUpdate.getTime() > 0
      ? toIso(latestContentUpdate)
      : toIso(new Date());

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: listPageLastModified },
    { url: `${baseUrl}/blog`, lastModified: listPageLastModified },
    { url: `${baseUrl}/portfolio`, lastModified: listPageLastModified },
    { url: `${baseUrl}/about`, lastModified: listPageLastModified },
    { url: `${baseUrl}/game`, lastModified: listPageLastModified },
    { url: `${baseUrl}/game/orange-game`, lastModified: listPageLastModified },
    { url: `${baseUrl}/game/tangerine-master`, lastModified: listPageLastModified },
  ];

  const portfolioPages: MetadataRoute.Sitemap = portfolios.map((project) => ({
    url: `${baseUrl}/portfolio/${project.category}/${project.slug}`,
    lastModified: toIso(getPortfolioDate(project.period)),
  }));

  const blogPages: MetadataRoute.Sitemap = Array.from(blogUrlMap.entries()).map(
    ([url, lastModified]) => ({ url, lastModified })
  );

  return [...staticPages, ...portfolioPages, ...blogPages];
}
