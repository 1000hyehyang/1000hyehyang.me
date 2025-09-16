import { getBlogPostBySlug } from "@/lib/github";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { markdownToHtml } from "@/lib/markdownToHtml";

// 동적 라우팅을 위한 정적 경로 생성
export async function generateStaticParams() {
  try {
    const { getAllBlogPosts } = await import("@/lib/github");
    const posts = await getAllBlogPosts();
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 실패:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: {
      absolute: post.frontmatter.title,
    },
    description: post.frontmatter.summary,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: "article",
      url: `${SITE_CONFIG.url}/blog/${slug}`,
      images: [
        {
          url: "/og/default.png",
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
      images: ["/og/default.png"],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return notFound();

  // 마크다운을 HTML로 변환
  const htmlContent = await markdownToHtml(post.content);

  return (
    <BlogDetail frontmatter={post.frontmatter}>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </BlogDetail>
  );
} 