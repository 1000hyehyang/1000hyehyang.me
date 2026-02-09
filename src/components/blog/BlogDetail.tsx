"use client";

import type { AdjacentPost, BlogDetailProps } from "@/types";
import { GiscusComments } from "@/components/common/GiscusComments";
import { LinkPreview } from "@/components/common/LinkPreview";
import { CopyCodeButton } from "@/components/common/CopyCodeButton";
import { GISCUS_BLOG_CONFIG } from "@/lib/config";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARD_CLASS =
  "group flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/15 dark:bg-muted/30 p-4 transition-colors hover:bg-muted/25 dark:hover:bg-muted/50 hover:border-orange-200/50";
const ICON_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/50 dark:bg-muted text-muted-foreground group-hover:bg-orange-200/20 group-hover:text-orange-300";

function AdjacentPostCard({
  post,
  direction,
  alignRightOnSm,
}: {
  post: AdjacentPost;
  direction: "prev" | "next";
  alignRightOnSm?: boolean;
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`${CARD_CLASS} ${isNext ? "flex-row-reverse" : ""} ${alignRightOnSm ? "sm:col-start-2" : ""}`}
    >
      <span className={ICON_CLASS}>
        {isNext ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </span>
      <div className={`min-w-0 flex-1 overflow-hidden ${isNext ? "text-right" : ""}`}>
        <span className="text-xs text-muted-foreground">{isNext ? "다음 글" : "이전 글"}</span>
        <p className="mt-0.5 truncate font-medium text-foreground group-hover:text-orange-300">{post.title}</p>
      </div>
    </Link>
  );
}

export const BlogDetail = ({ frontmatter, children, prevPost, nextPost }: BlogDetailProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // 동적 컴포넌트 렌더링
  useEffect(() => {
    // 링크 미리보기 렌더링
    const linkPreviewWrappers = document.querySelectorAll('.link-preview-wrapper');
    
    linkPreviewWrappers.forEach((wrapper) => {
      const url = wrapper.getAttribute('data-url');
      const linkText = wrapper.getAttribute('data-link-text');
      
      if (url && !wrapper.hasAttribute('data-rendered')) {
        const root = createRoot(wrapper);
        root.render(<LinkPreview url={url}>{linkText}</LinkPreview>);
        wrapper.setAttribute('data-rendered', 'true');
      }
    });

    // 코드 복사 버튼 렌더링
    const copyButtonWrappers = document.querySelectorAll('.copy-code-button');
    
    copyButtonWrappers.forEach((wrapper) => {
      const encodedCode = wrapper.getAttribute('data-code-encoded');
      
      if (encodedCode && !wrapper.hasAttribute('data-rendered')) {
        try {
          const decodedCode = decodeURIComponent(escape(atob(encodedCode)));
          const root = createRoot(wrapper);
          root.render(<CopyCodeButton code={decodedCode} />);
          wrapper.setAttribute('data-rendered', 'true');
        } catch (error) {
          console.error('코드 디코딩 실패:', error);
        }
      }
    });
  }, []);

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="prose prose-neutral dark:prose-invert max-w-none"
    >
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-1 mb-4">
          {frontmatter.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
          ))}
        </motion.div>
      )}
      <motion.h1 variants={itemVariants} className="font-semibold text-3xl mb-4">{frontmatter.title}</motion.h1>
      <motion.div variants={itemVariants} className="text-sm text-muted-foreground mb-6 flex gap-2 items-center">
        <span>{frontmatter.category}</span>
        <span>·</span>
        <span>{frontmatter.date}</span>
        {frontmatter.author && (
          <>
            <span>·</span>
            <span>by {frontmatter.author}</span>
          </>
        )}
      </motion.div>
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>

      {(prevPost || nextPost) && (
        <motion.nav
          variants={itemVariants}
          aria-label="이전 글 / 다음 글"
          className="mt-12 w-full min-w-0 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {prevPost && <AdjacentPostCard post={prevPost} direction="prev" />}
          {nextPost && <AdjacentPostCard post={nextPost} direction="next" alignRightOnSm={!prevPost} />}
        </motion.nav>
      )}

      <motion.div variants={itemVariants} className="mt-8">
        <GiscusComments
          repo={GISCUS_BLOG_CONFIG.repo as `${string}/${string}`}
          repoId={GISCUS_BLOG_CONFIG.repoId}
          category={GISCUS_BLOG_CONFIG.category}
          categoryId={GISCUS_BLOG_CONFIG.categoryId}
          term={frontmatter.title}
        />
      </motion.div>
    </motion.article>
  );
}; 