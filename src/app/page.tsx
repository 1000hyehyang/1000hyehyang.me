import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/mdx";
import { BottomNav } from "@/components/layout/BottomNav";

export default function Home() {
  const posts = getAllBlogPosts().slice(0, 3);
  return (
    <div className="flex flex-col min-h-screen items-center justify-between px-4 pt-12 pb-28">
      <main className="w-full flex flex-col items-center gap-8">
        <Image
          src="https://avatars.githubusercontent.com/u/102294782?v=4"
          alt="프로필"
          width={72}
          height={72}
          className="rounded-full mb-2"
          priority
        />
        <div className="text-center w-full">
          <div className="text-base font-medium mb-1">Today</div>
          <div className="text-sm text-muted-foreground mb-4">
            Founder {" "}
            <a
              href="https://github.com/bricks-team"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
              tabIndex={0}
              aria-label="bricks-team 깃허브로 이동"
            >
              @bricks-team ↗
            </a>
            , working as a Design Engineer.
          </div>
        </div>
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
        <section className="w-full">
          <div className="font-semibold mb-2">링크</div>
          <ul className="text-sm text-muted-foreground flex flex-col gap-1">
            <li><Link href="/about" className="hover:underline">이력</Link></li>
            <li><a href="https://github.com/yourid" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub ↗</a></li>
            <li><a href="https://x.com/yourid" target="_blank" rel="noopener noreferrer" className="hover:underline">X ↗</a></li>
            <li><a href="https://linkedin.com/in/yourid" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn ↗</a></li>
          </ul>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
