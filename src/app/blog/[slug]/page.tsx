import { getBlogPostBySlug, getMdxSource } from "@/lib/mdx";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface BlogDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: "article",
      url: `https://your-domain.com/blog/${params.slug}`,
      images: [
        {
          url: post.frontmatter.thumbnail || "/og/default.png",
          width: 1200,
          height: 630,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      images: [post.frontmatter.thumbnail || "/og/default.png"],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return notFound();
  const mdxSource = await getMdxSource(post.content);
  return <BlogDetail frontmatter={post.frontmatter} mdxSource={mdxSource} />;
} 