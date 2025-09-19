"use client";

import { BlogDetailProps } from "@/types";
import { GiscusComments } from "@/components/common/GiscusComments";
import { LinkPreview } from "@/components/common/LinkPreview";
import { GISCUS_BLOG_CONFIG } from "@/lib/config";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { createRoot } from "react-dom/client";

export const BlogDetail = ({ frontmatter, children }: BlogDetailProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // LinkPreview 컴포넌트를 동적으로 렌더링
  useEffect(() => {
    const linkPreviewWrappers = document.querySelectorAll('.link-preview-wrapper');
    
    linkPreviewWrappers.forEach((wrapper) => {
      const url = wrapper.getAttribute('data-url');
      const linkText = wrapper.getAttribute('data-link-text');
      
      // 이미 렌더링된 요소인지 확인
      if (url && !wrapper.hasAttribute('data-rendered')) {
        // React 컴포넌트를 렌더링하기 위해 createRoot 사용
        const root = createRoot(wrapper);
        root.render(<LinkPreview url={url}>{linkText}</LinkPreview>);
        
        // 렌더링 완료 표시
        wrapper.setAttribute('data-rendered', 'true');
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