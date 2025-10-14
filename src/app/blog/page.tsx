import { getAllBlogPosts, getPinnedPosts } from "@/lib/github";
import { BlogList } from "@/components/blog/BlogList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그",
  description: "글로 정리하며 성장하는 개발자 천혜향의 기록. 사소한 깨달음부터 프로젝트 여정까지 천천히 쌓여가는 이야기들.",
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogListPage() {
  const [posts, pinnedPosts] = await Promise.all([
    getAllBlogPosts(),
    getPinnedPosts()
  ]);
  return <BlogList posts={posts} pinnedPosts={pinnedPosts} />;
} 