import { getBlogPostBySlug, getPinnedPostBySlug, getAllBlogPosts, getPinnedPosts } from "@/lib/github";
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

async function getPostBySlug(slug: string) {
  return (await getBlogPostBySlug(slug)) ?? (await getPinnedPostBySlug(slug));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  // 이전/다음 글 (날짜 내림차순 기준)
  const [posts, pinnedPosts] = await Promise.all([getAllBlogPosts(), getPinnedPosts()]);
  const slugSet = new Set(posts.map((p) => p.slug));
  const merged = [...posts, ...pinnedPosts.filter((p) => !slugSet.has(p.slug))];
  const sorted = [...merged].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentIndex = sorted.findIndex((p) => p.slug === slug);
  const prevPost =
    currentIndex >= 0 && currentIndex < sorted.length - 1
      ? { slug: sorted[currentIndex + 1].slug, title: sorted[currentIndex + 1].title }
      : null;
  const nextPost =
    currentIndex > 0 ? { slug: sorted[currentIndex - 1].slug, title: sorted[currentIndex - 1].title } : null;

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
      <BlogDetail frontmatter={post.frontmatter} prevPost={prevPost} nextPost={nextPost}>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </BlogDetail>
    </>
  );
} 