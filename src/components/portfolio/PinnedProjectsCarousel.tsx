"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioFrontmatter } from "@/types";
import { getPortfolioDisplayCategory } from "@/lib/portfolio";

type PinnedProjectsCarouselProps = {
  projects: PortfolioFrontmatter[];
};

type CarouselState = {
  index: number;
  direction: -1 | 0 | 1;
};

export function PinnedProjectsCarousel({
  projects,
}: PinnedProjectsCarouselProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [{ index, direction }, setCarouselState] = useState<CarouselState>({
    index: 0,
    direction: 0,
  });

  if (projects.length === 0) return null;

  const activeIndex = Math.min(index, projects.length - 1);
  const activeProject = projects[activeIndex];
  const href = `/portfolio/${activeProject.category}/${activeProject.slug}`;
  const displayCategory = getPortfolioDisplayCategory(activeProject);
  const visibleTech = activeProject.tech.slice(0, 5);
  const overflowTechCount = activeProject.tech.length - visibleTech.length;
  const hasMultipleProjects = projects.length > 1;

  const selectProject = (nextIndex: number, nextDirection?: -1 | 1) => {
    if (nextIndex === activeIndex) return;

    const normalizedIndex =
      (nextIndex + projects.length) % projects.length;

    setCarouselState({
      index: normalizedIndex,
      direction:
        nextDirection ?? (normalizedIndex > activeIndex ? 1 : -1),
    });
  };

  return (
    <div
      className="min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="대표 프로젝트"
    >
      <div className="relative aspect-[200/81] overflow-hidden">
        {projects.map((project, projectIndex) => {
          const isActive = projectIndex === activeIndex;
          const previewOnLeft = direction > 0;
          const projectHref = `/portfolio/${project.category}/${project.slug}`;
          const slideContent = project.images?.[0] ? (
            <Image
              src={project.images[0]}
              alt={`${project.title} 썸네일`}
              fill
              priority={projectIndex === 0}
              sizes="(max-width: 639px) 80vw, (max-width: 1023px) 60vw, 540px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              이미지 준비 중
            </span>
          );

          return (
            <motion.div
              key={project.slug}
              initial={false}
              animate={{
                left: isActive ? "14%" : previewOnLeft ? "-18%" : "76%",
                width: isActive ? "72%" : "42%",
                top: "50%",
                y: "-50%",
                opacity: isActive ? 1 : 0.68,
                scale: isActive ? 1 : 0.98,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
              }
              className={`absolute aspect-video overflow-hidden rounded-xl ${
                isActive ? "z-10" : "z-0"
              }`}
            >
              {isActive ? (
                <Link
                  href={projectHref}
                  aria-label={`${project.title} 상세 보기`}
                  className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {slideContent}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => selectProject(projectIndex)}
                  className="block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  aria-label={`${project.title} 대표 프로젝트로 선택`}
                >
                  {slideContent}
                </button>
              )}
            </motion.div>
          );
        })}

        {hasMultipleProjects ? (
          <>
            <button
              type="button"
              onClick={() => selectProject(activeIndex - 1, -1)}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-background/45 p-2.5 text-foreground backdrop-blur-xl transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-3"
              aria-label="이전 대표 프로젝트"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => selectProject(activeIndex + 1, 1)}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-background/45 p-2.5 text-foreground backdrop-blur-xl transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-3"
              aria-label="다음 대표 프로젝트"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <div className="mx-auto mt-5 min-h-32 w-[72%]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeProject.slug}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, filter: "blur(8px)", y: -12 }
            }
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, filter: "blur(8px)", y: 8 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-live="polite"
          >
            <p className="mb-2 text-xs font-medium text-brand">
              {displayCategory} · {activeProject.period}
            </p>
            <Link
              href={href}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-2xl">
                {activeProject.title}
              </h3>
            </Link>
            {activeProject.summary ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activeProject.summary}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {visibleTech.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
              {overflowTechCount > 0 ? <span>+{overflowTechCount}</span> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {hasMultipleProjects ? (
        <div
          className="mt-5 flex items-center justify-center gap-2"
          aria-label="대표 프로젝트 선택"
        >
          {projects.map((project, projectIndex) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => selectProject(projectIndex)}
              className={`h-1.5 cursor-pointer rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                projectIndex === activeIndex
                  ? "w-8 bg-brand"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`${project.title} 보기`}
              aria-current={projectIndex === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
