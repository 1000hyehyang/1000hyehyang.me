"use client";

import { PortfolioFrontmatter } from "@/types";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface PortfolioDetailProps {
  frontmatter: PortfolioFrontmatter;
  children: React.ReactNode;
}

export const PortfolioDetail = ({ frontmatter, children }: PortfolioDetailProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

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
            <h1 className="text-3xl font-bold mb-4">{frontmatter.title}</h1>
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
      <motion.div variants={itemVariants} className="mb-8">
        <Image
          src="/portfolio/ururu.png"
          alt={`${frontmatter.title} 썸네일`}
          width={800}
          height={400}
          className="w-full rounded-lg object-cover"
          priority
        />
      </motion.div>

      {/* 기술 스택 */}
      {frontmatter.tech && frontmatter.tech.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">사용 기술</h2>
          <div className="flex flex-wrap gap-2">
            {frontmatter.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
              >
                {tech}
              </span>
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