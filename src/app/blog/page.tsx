import { getAllBlogPosts, getPinnedPosts } from "@/lib/github";
import { BlogList } from "@/components/blog/BlogList";

export default async function BlogListPage() {
  const [posts, pinnedPosts] = await Promise.all([
    getAllBlogPosts(),
    getPinnedPosts()
  ]);
  return <BlogList posts={posts} pinnedPosts={pinnedPosts} />;
} 