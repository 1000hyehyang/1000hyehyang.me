import { getPortfolioBySlug } from "@/lib/mdx";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
    openGraph: {
      title: project.frontmatter.title,
      description: project.frontmatter.summary,
      type: "article",
      url: `https://1000hyehyang.me/portfolio/${slug}`,
      images: [
        {
          url: project.frontmatter.images?.[0] || "/og/default.png",
          width: 1200,
          height: 630,
          alt: project.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.frontmatter.title,
      description: project.frontmatter.summary,
      images: [project.frontmatter.images?.[0] || "/og/default.png"],
    },
  };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  if (!project) return notFound();
  
  return (
    <PortfolioDetail frontmatter={project.frontmatter}>
      <div dangerouslySetInnerHTML={{ __html: project.content }} />
    </PortfolioDetail>
  );
} 