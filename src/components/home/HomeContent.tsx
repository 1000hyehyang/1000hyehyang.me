"use client";

import Image from "next/image";
import Link from "next/link";
import { GITHUB_CONFIG } from "@/lib/config";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { BlogFrontmatter } from "@/types";

interface HomeContentProps {
  posts: BlogFrontmatter[];
}

export const HomeContent = ({ posts }: HomeContentProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="flex flex-col min-h-screen items-center justify-between pt-12"
    >
      <main className="w-full flex flex-col items-center gap-8">
        {/* 프로필 이미지 */}
        <motion.div variants={itemVariants}>
          <Image
            src={`https://avatars.githubusercontent.com/u/${GITHUB_CONFIG.userId}?v=4`}
            alt="프로필"
            width={72}
            height={72}
            className="rounded-full mb-2"
            priority
          />
        </motion.div>

        {/* 최근 작성한 글 섹션 */}
        <motion.section variants={itemVariants} className="w-full">
          <div className="font-semibold mb-2">최근 작성한 글</div>
          <ul className="text-sm text-muted-foreground flex flex-col gap-1">
            {posts.map((post, index) => (
              <motion.li 
                key={post.slug}
                variants={itemVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:underline focus:underline focus:outline-none transition-colors"
                  tabIndex={0}
                  aria-label={`${post.title} 상세 보기`}
                >
                  {post.title}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </main>
    </motion.div>
  );
}; 