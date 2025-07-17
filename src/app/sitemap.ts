import { getAllBlogPosts, getAllPortfolio } from "@/lib/mdx";

export default async function sitemap() {
  const baseUrl = "https://1000hyehyang.me";
  const blogPosts = getAllBlogPosts();
  const portfolios = getAllPortfolio();

  const urls = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/blog`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/portfolio`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString() },
    ...blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.date,
    })),
    ...portfolios.map(p => ({
      url: `${baseUrl}/portfolio/${p.slug}`,
      lastModified: p.period,
    })),
  ];

  return urls;
} 