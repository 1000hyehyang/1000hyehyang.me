"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { PortfolioDetailProps, PortfolioFrontmatter } from "@/types";
import { getPortfolioDisplayCategory } from "@/lib/portfolio";
import { groupProjectTechByCategory } from "@/lib/tech-stack-data";
import { useGsapScrollReveal } from "@/hooks/useGsapScrollReveal";
import { useMarkdownBodyHydration } from "@/hooks/useHydrateMarkdownWidgets";
import { TechBadge } from "./TechBadge";

function ProjectTechList({ frontmatter }: { frontmatter: PortfolioFrontmatter }) {
  if (!frontmatter.tech.length) return null;

  if (!frontmatter.categorizedTech) {
    return (
      <div className="flex flex-wrap gap-2">
        {frontmatter.tech.map((tech, index) => (
          <TechBadge key={tech} tech={tech} index={index} />
        ))}
      </div>
    );
  }

  const groupedTech = groupProjectTechByCategory(frontmatter.tech);
  const categories = Object.keys(groupedTech).sort();
  let globalIndex = 0;

  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupedTech[category].map((tech) => (
              <TechBadge key={tech} tech={tech} index={globalIndex++} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioDetail({ frontmatter, children }: PortfolioDetailProps) {
  const scrollPaneRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const setMarkdownContainerRef = useMarkdownBodyHydration();
  const displayCategory = getPortfolioDisplayCategory(frontmatter);
  const hasLinks = Boolean(frontmatter.githubUrl || frontmatter.siteUrl);
  const hasProjectDetails = Boolean(
    frontmatter.teamMembers || frontmatter.myRole,
  );

  useGsapScrollReveal(scrollPaneRef, {
    selector: "[data-scroll-reveal], .markdown-body > *",
    initialY: -30,
  });

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <div className="portfolio-split-grid">
        <aside className="portfolio-detail-aside min-w-0 pb-2 pt-8 sm:pt-10 lg:sticky lg:top-[var(--site-header-height)] lg:self-start lg:py-10">
          <Link
            href="/portfolio"
            className="portfolio-detail-back mb-10 inline-flex items-center gap-2 rounded-md py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Archive
          </Link>

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-brand">
            {displayCategory}
          </p>
          <h1 className="portfolio-detail-title text-3xl font-semibold leading-tight tracking-[-0.04em] text-foreground lg:text-[2rem]">
            {frontmatter.title}
          </h1>

          {frontmatter.summary ? (
            <p className="portfolio-detail-summary mt-6 text-sm leading-6 text-muted-foreground">
              {frontmatter.summary}
            </p>
          ) : null}

          <dl className="portfolio-detail-meta mt-8 space-y-5">
            <div>
              <dt className="mb-1.5 text-xs font-medium text-muted-foreground">
                작업 기간
              </dt>
              <dd className="text-sm leading-6 text-foreground">
                {frontmatter.period}
              </dd>
            </div>
          </dl>

          {hasProjectDetails ? (
            <section
              className="mt-8 border-t border-border pt-8"
              aria-labelledby="project-details-title"
            >
              <h2
                id="project-details-title"
                className="mb-5 text-sm font-semibold text-foreground"
              >
                프로젝트 정보
              </h2>
              <dl className="space-y-5">
                {frontmatter.teamMembers ? (
                  <div>
                    <dt className="mb-1.5 text-xs font-medium text-muted-foreground">
                      팀 구성
                    </dt>
                    <dd className="text-sm leading-6 text-foreground">
                      {frontmatter.teamMembers}
                    </dd>
                  </div>
                ) : null}
                {frontmatter.myRole ? (
                  <div>
                    <dt className="mb-1.5 text-xs font-medium text-muted-foreground">
                      담당 역할
                    </dt>
                    <dd className="break-words text-sm leading-6 text-foreground">
                      {frontmatter.myRole}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {hasLinks ? (
            <div className="portfolio-detail-links mt-7 flex flex-wrap gap-2">
              {frontmatter.githubUrl ? (
                <a
                  href={frontmatter.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="GitHub 저장소 보기"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </a>
              ) : null}
              {frontmatter.siteUrl ? (
                <a
                  href={frontmatter.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="프로젝트 사이트 보기"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Site
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>

        <div
          ref={scrollPaneRef}
          className="min-w-0 pb-16 pt-8 sm:pt-10 lg:py-10"
        >
          {frontmatter.images?.[0] ? (
            <div
              data-scroll-reveal
              className="relative mb-12 aspect-video overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={frontmatter.images[0]}
                alt={`${frontmatter.title} 썸네일`}
                fill
                priority
                sizes="(max-width: 1023px) calc(100vw - 2rem), 820px"
                className="object-cover"
              />
            </div>
          ) : null}

          {frontmatter.tech.length > 0 ? (
            <section
              data-scroll-reveal
              className="mb-12 pb-12"
              aria-labelledby="project-tech-title"
            >
              <h2
                id="project-tech-title"
                className="mb-5 text-lg font-semibold text-foreground"
              >
                사용 기술
              </h2>
              <ProjectTechList frontmatter={frontmatter} />
            </section>
          ) : null}

          <div ref={setMarkdownContainerRef}>{children}</div>
        </div>
      </div>
    </motion.article>
  );
}
