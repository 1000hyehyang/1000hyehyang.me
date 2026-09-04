"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Github } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { PortfolioDetailProps, PortfolioFrontmatter } from "@/types";
import { getPortfolioDisplayCategory } from "@/lib/portfolio";
import { groupProjectTechByCategory } from "@/lib/project-tech-categories";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TechBadge } from "./TechBadge";

function ProjectTechList({
  frontmatter,
  disableBadgeAnimation = false,
}: {
  frontmatter: PortfolioFrontmatter;
  disableBadgeAnimation?: boolean;
}) {
  if (!frontmatter.tech.length) return null;

  if (!frontmatter.categorizedTech) {
    return (
      <div className="flex flex-wrap gap-2" data-tab-reveal>
        {frontmatter.tech.map((tech, index) => (
          <TechBadge
            key={tech}
            tech={tech}
            index={index}
            disableAnimation={disableBadgeAnimation}
          />
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
        <div key={category} className="space-y-2" data-tab-reveal>
          <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupedTech[category].map((tech) => (
              <TechBadge
                key={tech}
                tech={tech}
                index={globalIndex++}
                disableAnimation={disableBadgeAnimation}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type PortfolioTab = "core" | "info";

export function PortfolioDetail({
  frontmatter,
  children,
  infoContent,
}: PortfolioDetailProps) {
  const scrollPaneRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PortfolioTab>("core");
  const shouldReduceMotion = Boolean(useReducedMotion());
  const displayCategory = getPortfolioDisplayCategory(frontmatter);
  const hasLinks = Boolean(frontmatter.githubUrl || frontmatter.siteUrl);
  const hasTabbedContent = infoContent !== undefined;

  useScrollReveal(scrollPaneRef, {
    selector: hasTabbedContent
      ? "[data-scroll-reveal]"
      : "[data-scroll-reveal], .markdown-body > *",
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
          </dl>

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

          {!hasTabbedContent && frontmatter.tech.length > 0 ? (
            <section
              data-scroll-reveal
              className="mb-12"
              aria-labelledby="project-tech-title"
            >
              <h2
                id="project-tech-title"
                className="mb-5 text-lg font-semibold text-foreground"
              >
                기술 스택
              </h2>
              <ProjectTechList frontmatter={frontmatter} />
            </section>
          ) : null}

          {frontmatter.myRole ? (
            <section
              data-scroll-reveal
              className="mb-12"
              aria-labelledby="project-role-title"
            >
              <h2
                id="project-role-title"
                className="mb-5 text-lg font-semibold text-foreground"
              >
                역할과 기여
              </h2>
              <div className="overflow-hidden rounded-2xl bg-muted/50">
                <div className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
                  <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    My role
                  </p>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                    {frontmatter.myRole.title}
                  </h3>
                  {frontmatter.myRole.summary ? (
                    <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
                      {frontmatter.myRole.summary}
                    </p>
                  ) : null}
                </div>

                {frontmatter.myRole.contributions.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-y-4 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                    {frontmatter.myRole.contributions.map((contribution) => (
                      <li
                        key={contribution}
                        className="flex min-w-0 items-start gap-3 text-sm leading-6 text-foreground"
                      >
                        <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                          <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        </span>
                        <span className="break-words">{contribution}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasTabbedContent ? (
            <>
              <div
                className="mb-10 flex gap-8 border-b border-border"
                role="tablist"
                aria-label="프로젝트 상세 콘텐츠"
              >
                {(["core", "info"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === "core" ? "CORE" : "INFO";

                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      id={`project-${tab}-tab`}
                      aria-selected={isActive}
                      aria-controls={`project-${tab}-panel`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "ArrowLeft" ||
                          event.key === "ArrowRight"
                        ) {
                          event.preventDefault();
                          const nextTab = tab === "core" ? "info" : "core";
                          setActiveTab(nextTab);
                          event.currentTarget.parentElement
                            ?.querySelector<HTMLButtonElement>(
                              `#project-${nextTab}-tab`,
                            )
                            ?.focus();
                        }
                      }}
                      className={`relative -mb-px cursor-pointer border-b-2 px-1 pb-3 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        isActive
                          ? "border-brand text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div
                key={activeTab}
                id={`project-${activeTab}-panel`}
                role="tabpanel"
                aria-labelledby={`project-${activeTab}-tab`}
                tabIndex={0}
                className="portfolio-tab-panel focus-visible:outline-none"
              >
                {activeTab === "core" ? (
                  children
                ) : (
                  <>
                    {frontmatter.tech.length > 0 ? (
                      <section
                        aria-labelledby="project-info-tech-title"
                      >
                        <h2
                          id="project-info-tech-title"
                          className="mb-5 text-lg font-semibold text-foreground"
                          data-tab-reveal
                        >
                          기술 스택
                        </h2>
                        <ProjectTechList
                          frontmatter={frontmatter}
                          disableBadgeAnimation
                        />
                      </section>
                    ) : null}
                    <div
                      className={frontmatter.tech.length > 0 ? "mt-12" : undefined}
                    >
                      {infoContent}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </motion.article>
  );
}
