import { getBlogPostBySlug, getPinnedPostBySlug } from "@/lib/github";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { markdownToHtml } from "@/lib/markdownToHtml";

// 동적 라우팅을 위한 정적 경로 생성
export async function generateStaticParams() {
  try {
    const { getAllBlogPosts, getPinnedPosts } = await import("@/lib/github");
    
    const [posts, pinnedPosts] = await Promise.all([
      getAllBlogPosts(),
      getPinnedPosts()
    ]);
    
    // 일반 블로그 글과 고정 글 모두 포함
    const allPosts = [...posts, ...pinnedPosts];
    
    return allPosts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 실패:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // 먼저 일반 블로그 글에서 찾기
  let post = await getBlogPostBySlug(slug);
  
  // 일반 블로그 글에 없으면 고정 글에서 찾기
  if (!post) {
    post = await getPinnedPostBySlug(slug);
  }
  
  if (!post) return {};
  
  return {
    title: {
      absolute: post.frontmatter.title,
    },
    description: post.frontmatter.summary,
    keywords: post.frontmatter.tags?.join(', '),
    authors: [{ name: post.frontmatter.author || '천혜향' }],
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      type: "article",
      url: `${SITE_CONFIG.url}/blog/${slug}`,
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updatedAt,
      authors: [post.frontmatter.author || '천혜향'],
      tags: post.frontmatter.tags,
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
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 먼저 일반 블로그 글에서 찾기
  let post = await getBlogPostBySlug(slug);
  
  // 일반 블로그 글에 없으면 고정 글에서 찾기
  if (!post) {
    post = await getPinnedPostBySlug(slug);
  }
  
  if (!post) return notFound();

  // 마크다운을 HTML로 변환
  const htmlContent = await markdownToHtml(post.content);

  // 구조화된 데이터 (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.frontmatter.title,
    "description": post.frontmatter.summary,
    "author": {
      "@type": "Person",
      "name": post.frontmatter.author || "천혜향"
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url
    },
    "datePublished": post.frontmatter.date,
    "dateModified": post.frontmatter.updatedAt || post.frontmatter.date,
    "url": `${SITE_CONFIG.url}/blog/${slug}`,
    "keywords": post.frontmatter.tags?.join(', '),
    "articleSection": post.frontmatter.category,
    "wordCount": htmlContent.replace(/<[^>]*>/g, '').split(' ').length
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogDetail frontmatter={post.frontmatter}>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </BlogDetail>
    </>
  );
} 