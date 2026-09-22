"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RevealContent } from "@/components/common/RevealContent";
import type { PortfolioFilter, PortfolioFrontmatter } from "@/types";
import {
  isPortfolioInFilter,
  PORTFOLIO_FILTERS,
} from "@/lib/portfolio";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { usePortfolioUrlState } from "@/hooks/usePortfolioUrlState";
import { PinnedProjectsCarousel } from "./PinnedProjectsCarousel";
import { PortfolioCard } from "./PortfolioCard";

type PortfolioListProps = {
  projects: readonly PortfolioFrontmatter[];
  pinnedProjects: readonly PortfolioFrontmatter[];
  archiveStats: Readonly<Record<PortfolioFilter, number>>;
};

const FILTER_ARIA_LABELS: Record<PortfolioFilter, string> = {
  total: "전체 작업",
  dev: "개발 프로젝트",
  hackathons: "해커톤",
  design: "디자인 프로젝트",
};

type FilteredPortfolioGridProps = {
  projects: readonly PortfolioFrontmatter[];
};

function FilteredPortfolioGrid({
  projects,
}: FilteredPortfolioGridProps) {
  return (
    <RevealContent className="min-w-0">
      {projects.length > 0 ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
          {projects.map((project) => (
            <div key={project.slug} data-content-reveal>
              <PortfolioCard {...project} />
            </div>
          ))}
        </div>
      ) : (
        <p
          data-content-reveal
          className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground"
        >
          이 분류에 표시할 다른 작업이 없습니다.
        </p>
      )}
    </RevealContent>
  );
}

export function PortfolioList({
  projects,
  pinnedProjects,
  archiveStats,
}: PortfolioListProps) {
  const pageRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const { filter: selectedFilter, setFilter } = usePortfolioUrlState();
  useScrollReveal(pageRef, {
    selector: "[data-page-scroll-reveal]",
  });

  const otherProjects = projects.filter((project) =>
    isPortfolioInFilter(project, selectedFilter),
  );

  return (
    <section
      ref={pageRef}
      className="w-full pb-16 pt-8 sm:pt-12 lg:pb-20 lg:pt-16"
    >
      <header className="max-w-3xl pb-16 lg:pb-20">
        <p data-page-scroll-reveal className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-brand">
          Project Archive
        </p>
        <h1 data-page-scroll-reveal className="mb-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
          Projects
        </h1>
        <p data-page-scroll-reveal className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          기획부터 배포와 개선까지, 문제를 해결하며 완성해 온 프로젝트의 과정과 결과를 기록했습니다.
        </p>

        <dl data-page-scroll-reveal className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {PORTFOLIO_FILTERS.map((filter) => (
            <div key={filter} className="flex items-baseline gap-1.5">
              <dt>{filter}</dt>
              <dd className="font-semibold text-foreground">
                {archiveStats[filter]}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section
        className="mx-auto w-full max-w-3xl"
      >
        <PinnedProjectsCarousel projects={pinnedProjects} />
      </section>

      <section className="mt-24 sm:mt-28 lg:mt-32">
        <div className="mb-10 sm:mb-12">
          <h2 data-page-scroll-reveal className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            Other projects
          </h2>
          <p data-page-scroll-reveal className="mt-3 text-sm leading-6 text-muted-foreground">
            지금까지 진행한 프로젝트와 해커톤입니다.
          </p>

          <div
            data-page-scroll-reveal
            className="mt-6 flex flex-wrap gap-1.5"
            aria-label="프로젝트 분류 필터"
            role="group"
          >
            {PORTFOLIO_FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <motion.button
                  key={filter}
                  type="button"
                  onClick={() => setFilter(filter)}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? "bg-brand-soft text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-label={`${FILTER_ARIA_LABELS[filter]} 보기`}
                  aria-pressed={isSelected}
                >
                  {filter}
                </motion.button>
              );
            })}
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {FILTER_ARIA_LABELS[selectedFilter]} {otherProjects.length}개 표시 중
          </p>
        </div>

        <FilteredPortfolioGrid key={selectedFilter} projects={otherProjects} />
      </section>
    </section>
  );
}
