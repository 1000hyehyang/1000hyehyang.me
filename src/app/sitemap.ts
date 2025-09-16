import { getAllPortfolio } from "@/lib/mdx";
import { getAllBlogPosts } from "@/lib/github";
import { SITE_CONFIG } from "@/lib/config";

export default async function sitemap() {
  const baseUrl = SITE_CONFIG.url;
  const portfolios = getAllPortfolio();
  const blogPosts = await getAllBlogPosts();

  const urls = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/blog`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/portfolio`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/game`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/game/orange-game`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/game/tangerine-master`, lastModified: new Date().toISOString() },
    // 포트폴리오 페이지들
    ...portfolios.map(p => ({
      url: `${baseUrl}/portfolio/${p.category}/${p.slug}`,
      lastModified: new Date().toISOString(),
    })),
    // 블로그 포스트들
    ...blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.date).toISOString(),
    })),
  ];

  return urls;
} 