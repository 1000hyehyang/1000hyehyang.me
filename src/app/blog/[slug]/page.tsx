import { getBlogPostBySlug, serializeMdxContent } from "@/lib/mdx";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: "article",
      url: `https://1000hyehyang.me/blog/${slug}`,
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

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return notFound();
  const mdxSource = await serializeMdxContent(post.content);
  return <BlogDetail frontmatter={post.frontmatter} mdxSource={mdxSource} />;
} 