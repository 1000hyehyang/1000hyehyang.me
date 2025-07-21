import { getPortfolioBySlug } from "@/lib/mdx";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const item = getPortfolioBySlug(category as "project" | "hackathon", slug);
  if (!item) return {};
  return {
    title: item.frontmatter.title,
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
  return (
    <PortfolioDetail frontmatter={item.frontmatter}>
      <div dangerouslySetInnerHTML={{ __html: item.content }} />
    </PortfolioDetail>
  );
} 