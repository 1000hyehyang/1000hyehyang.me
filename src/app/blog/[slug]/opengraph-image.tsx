import { cache } from "react";
import { getBlogPostBySlug, getPinnedPostBySlug } from "@/lib/github";
import { SITE_CONFIG } from "@/lib/config";
import { createOgImageResponse } from "@/lib/og/create-og-image";

export const runtime = "edge";
export const alt = "블로그 글 Open Graph Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const getPostBySlug = cache(async (slug: string) => {
  return (await getBlogPostBySlug(slug)) ?? (await getPinnedPostBySlug(slug));
});

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return createOgImageResponse({
      siteName: SITE_CONFIG.name,
      title: "글을 찾을 수 없습니다",
      footer: SITE_CONFIG.name,
    });
  }

  const { frontmatter } = post;

  return createOgImageResponse({
    siteName: SITE_CONFIG.name,
    badge: frontmatter.category,
    meta: frontmatter.date,
    title: frontmatter.title,
    description: frontmatter.summary,
    footer: `${SITE_CONFIG.name} · Blog`,
  });
}
