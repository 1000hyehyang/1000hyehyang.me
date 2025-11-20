"use client";

import { PortfolioDetailProps } from "@/types";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { LinkPreview } from "@/components/common/LinkPreview";
import { CopyCodeButton } from "@/components/common/CopyCodeButton";
import { createRoot } from "react-dom/client";
import { TechBadge } from "@/components/portfolio/TechBadge";

export const PortfolioDetail = ({ frontmatter, children }: PortfolioDetailProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // LinkPreview와 CopyCodeButton 컴포넌트를 동적으로 렌더링
  useEffect(() => {
    // LinkPreview 렌더링
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

    // CopyCodeButton 렌더링
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
      className="w-full"
    >
      {/* 프로젝트 헤더 */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* 프로젝트 정보 */}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-4">{frontmatter.title}</h1>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>{frontmatter.period}</div>
              {frontmatter.summary && (
                <div className="text-base text-foreground">{frontmatter.summary}</div>
              )}
            </div>
          </div>

          {/* 링크 버튼들 */}
          <motion.div variants={itemVariants} className="flex gap-2">
            {frontmatter.githubUrl && (
              <a
                href={frontmatter.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                aria-label="GitHub 저장소 보기"
                tabIndex={0}
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
            )}
            {frontmatter.siteUrl && (
              <a
                href={frontmatter.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                aria-label="사이트 보기"
                tabIndex={0}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Site</span>
              </a>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* 썸네일 이미지 */}
      {frontmatter.images && frontmatter.images[0] && (
        <motion.div variants={itemVariants} className="mb-8">
          <Image
            src={frontmatter.images[0]}
            alt={`${frontmatter.title} 썸네일`}
            width={800}
            height={400}
            className="w-full rounded-lg object-cover"
            unoptimized
          />
        </motion.div>
      )}

      {/* 기술 스택 */}
      {frontmatter.tech && frontmatter.tech.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">사용 기술</h2>
          <div className="flex flex-wrap gap-2">
            {frontmatter.tech.map((tech) => (
              <TechBadge key={tech} tech={tech} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 프로젝트 상세 내용 */}
      <motion.div variants={itemVariants} className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </motion.div>
    </motion.article>
  );
}; 