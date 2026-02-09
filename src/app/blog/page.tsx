import { Suspense } from "react";
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
  return (
    <Suspense
      fallback={
        <section className="w-full animate-pulse">
          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-16 rounded-md bg-muted/40" />
            ))}
          </div>
          <div className="mb-6 h-12 rounded-lg bg-muted/40" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted/40" />
            ))}
          </div>
        </section>
      }
    >
      <BlogList posts={posts} pinnedPosts={pinnedPosts} />
    </Suspense>
  );
} 