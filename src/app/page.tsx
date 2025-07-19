import { getAllBlogPosts } from "@/lib/github";
import { HomeContent } from "@/components/home/HomeContent";

export default async function Home() {
  const posts = (await getAllBlogPosts()).slice(0, 3);
  
  return <HomeContent posts={posts} />;
}
