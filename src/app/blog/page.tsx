import { getAllBlogPosts } from "@/lib/mdx";
import { BlogList } from "@/components/blog/BlogList";

export default function BlogListPage() {
  const posts = getAllBlogPosts();
  return <BlogList posts={posts} />;
} 