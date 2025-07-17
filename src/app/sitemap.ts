import { getAllBlogPosts, getAllPortfolio } from "@/lib/mdx";

export async function GET() {
  const baseUrl = "https://your-domain.com";
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) => `<url><loc>${u.url}</loc><lastmod>${u.lastModified}</lastmod></url>`
    )
    .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
} 