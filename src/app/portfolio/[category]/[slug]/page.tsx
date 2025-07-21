import { getPortfolioBySlug } from "@/lib/mdx";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { markdownToHtml } from "@/lib/markdownToHtml";

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const item = getPortfolioBySlug(category as "project" | "hackathon", slug);
  if (!item) return {};
  return {
    title: {
      absolute: item.frontmatter.title,
    },
    description: item.frontmatter.summary,
    openGraph: {
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
      type: "article",
      url: `${SITE_CONFIG.url}/portfolio/${category}/${slug}`,
      images: [
        {
          url: item.frontmatter.images?.[0] || "/og/default.png",
          width: 1200,
          height: 630,
          alt: item.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
      images: [item.frontmatter.images?.[0] || "/og/default.png"],
    },
  };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const item = getPortfolioBySlug(category as "project" | "hackathon", slug);
  if (!item) return notFound();
  // 마크다운을 HTML로 변환
  const htmlContent = await markdownToHtml(item.content);
  return (
    <PortfolioDetail frontmatter={item.frontmatter}>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </PortfolioDetail>
  );
} 