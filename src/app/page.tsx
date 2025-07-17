import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/mdx";

export default function Home() {
  const posts = getAllBlogPosts().slice(0, 3);
  return (
    <div className="flex flex-col min-h-screen items-center justify-between pt-12">
      <main className="w-full flex flex-col items-center gap-8">
        <Image
          src="https://avatars.githubusercontent.com/u/102294782?v=4"
          alt="프로필"
          width={72}
          height={72}
          className="rounded-full mb-2"
          priority
        />
        <section className="w-full">
          <div className="font-semibold mb-2">최근 작성한 글</div>
          <ul className="text-sm text-muted-foreground flex flex-col gap-1">
            {posts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:underline focus:underline focus:outline-none"
                  tabIndex={0}
                  aria-label={`${post.title} 상세 보기`}
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
