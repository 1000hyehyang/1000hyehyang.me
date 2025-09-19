import { getAllPortfolio } from "@/lib/mdx";
import { getAllBlogPosts, getPinnedPosts } from "@/lib/github";
import { SITE_CONFIG } from "@/lib/config";

export default async function sitemap() {
  const baseUrl = SITE_CONFIG.url;
  const portfolios = getAllPortfolio();
  const [blogPosts, pinnedPosts] = await Promise.all([
    getAllBlogPosts(),
    getPinnedPosts()
  ]);

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
    // 일반 블로그 포스트들
    ...blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.date).toISOString(),
    })),
    // 고정 글들
    ...pinnedPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date).toISOString(),
    })),
  ];

  return urls;
} 