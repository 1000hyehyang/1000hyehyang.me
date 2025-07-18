import { getAllBlogPosts } from "@/lib/github";
import { BlogList } from "@/components/blog/BlogList";

export default async function BlogListPage() {
  const posts = await getAllBlogPosts();
  return <BlogList posts={posts} />;
} 