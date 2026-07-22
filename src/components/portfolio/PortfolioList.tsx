"use client";

import { useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PortfolioFilter, PortfolioFrontmatter } from "@/types";
import {
  isPortfolioInFilter,
  PORTFOLIO_FILTERS,
  sortPortfolioNewestFirst,
} from "@/lib/portfolio";
import { useGsapScrollReveal } from "@/hooks/useGsapScrollReveal";
import { usePortfolioUrlState } from "@/hooks/usePortfolioUrlState";
import { PinnedProjectsCarousel } from "./PinnedProjectsCarousel";
import { PortfolioCard } from "./PortfolioCard";

type PortfolioListProps = {
  projects: PortfolioFrontmatter[];
  initialFilter: PortfolioFilter;
};

const FILTER_ARIA_LABELS: Record<PortfolioFilter, string> = {
  total: "전체 작업",
  dev: "개발 프로젝트",
  hackathons: "해커톤",
  design: "디자인 프로젝트",
};

type FilteredPortfolioGridProps = {
  projects: PortfolioFrontmatter[];
  shouldReduceMotion: boolean;
};

function FilteredPortfolioGrid({
  projects,
  shouldReduceMotion,
}: FilteredPortfolioGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  useGsapScrollReveal(gridRef, { initialY: -30 });

  return (
    <motion.div
      ref={gridRef}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="min-w-0"
    >
      {projects.length > 0 ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
          {projects.map((project) => (
            <div key={project.slug} data-scroll-reveal>
              <PortfolioCard {...project} />
            </div>
          ))}
        </div>
      ) : (
        <p
          data-scroll-reveal
          className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground"
        >
          이 분류에 표시할 다른 작업이 없습니다.
        </p>
      )}
    </motion.div>
  );
}

export function PortfolioList({
  projects,
  initialFilter,
}: PortfolioListProps) {
  const pageRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const { filter: selectedFilter, setFilter } =
    usePortfolioUrlState(initialFilter);
  useGsapScrollReveal(pageRef, {
    selector: "[data-page-scroll-reveal]",
    initialY: -30,
  });

  const sortedProjects = useMemo(
    () => sortPortfolioNewestFirst(projects),
    [projects],
  );

  const pinnedProjects = useMemo(
    () => sortedProjects.filter((project) => project.pinned),
    [sortedProjects],
  );

  const otherProjects = useMemo(
    () =>
      sortedProjects.filter(
        (project) => !project.pinned && isPortfolioInFilter(project, selectedFilter),
      ),
    [selectedFilter, sortedProjects],
  );

  const archiveStats = useMemo(
    () => ({
      total: sortedProjects.length,
      dev: sortedProjects.filter((project) => isPortfolioInFilter(project, "dev"))
        .length,
      hackathons: sortedProjects.filter((project) =>
        isPortfolioInFilter(project, "hackathons"),
      ).length,
      design: sortedProjects.filter((project) =>
        isPortfolioInFilter(project, "design"),
      ).length,
    }),
    [sortedProjects],
  );

  return (
    <motion.section
      ref={pageRef}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full pb-16 pt-8 sm:pt-12 lg:pb-20 lg:pt-16"
    >
      <header data-page-scroll-reveal className="max-w-3xl pb-16 lg:pb-20">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-brand">
          Project Archive
        </p>
        <h1 className="mb-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
          Projects
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          기획부터 배포와 개선까지, 문제를 해결하며 완성해 온 프로젝트의 과정과 결과를 기록했습니다.
        </p>

        <dl className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-xs text-muted-foreground">
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
        data-page-scroll-reveal
        className="mx-auto w-full max-w-3xl"
      >
        <PinnedProjectsCarousel projects={pinnedProjects} />
      </section>

      <section className="mt-24 sm:mt-28 lg:mt-32">
        <div data-page-scroll-reveal className="mb-10 sm:mb-12">
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            Other projects
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            지금까지 진행한 프로젝트와 해커톤입니다.
          </p>

          <div
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

        <AnimatePresence mode="wait">
          <FilteredPortfolioGrid
            key={selectedFilter}
            projects={otherProjects}
            shouldReduceMotion={shouldReduceMotion}
          />
        </AnimatePresence>
      </section>
    </motion.section>
  );
}
