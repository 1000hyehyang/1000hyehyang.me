import { cache } from "react";
import { getBlogPostBySlug, getPinnedPostBySlug, getAllBlogPosts, getPinnedPosts, getAdjacentBlogPosts } from "@/lib/github";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { markdownToHtml } from "@/lib/markdownToHtml";

export async function generateStaticParams() {
  try {
    const [posts, pinnedPosts] = await Promise.all([
      getAllBlogPosts(),
      getPinnedPosts()
    ]);
    
    const allPosts = [...posts, ...pinnedPosts];
    
    return allPosts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 실패:', error);
    return [];
  }
}

const getPostBySlug = cache(async (slug: string) => {
  return (await getBlogPostBySlug(slug)) ?? (await getPinnedPostBySlug(slug));
});

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
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
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

  const [{ prevPost, nextPost }, htmlContent] = await Promise.all([
    getAdjacentBlogPosts(slug),
    markdownToHtml(post.content),
  ]);

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
