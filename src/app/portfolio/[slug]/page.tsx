import { getPortfolioBySlug, getMdxSource } from "@/lib/mdx";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PortfolioDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  const project = getPortfolioBySlug(params.slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
    openGraph: {
      title: project.frontmatter.title,
      description: project.frontmatter.summary,
      type: "article",
      url: `https://1000hyehyang.me/portfolio/${params.slug}`,
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

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const project = getPortfolioBySlug(params.slug);
  if (!project) return notFound();
  const mdxSource = await getMdxSource(project.content);
  return <PortfolioDetail frontmatter={project.frontmatter} mdxSource={mdxSource} />;
} 