"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioFrontmatter } from "@/types";
import { getPortfolioPath } from "@/lib/portfolio";

type ProjectCarouselProps = {
  projects: readonly PortfolioFrontmatter[];
  details: Readonly<Record<string, ReactNode>>;
};

export function ProjectCarousel({ projects, details }: ProjectCarouselProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  if (!projects.length) return null;

  const selectProject = (index: number) => {
    const track = viewport.current;
    if (!track) return;
    track.scrollTo({ left: ((index + projects.length) % projects.length) * track.clientWidth });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="대표 프로젝트" className="min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_2.75rem_2.75rem] items-center gap-x-1 gap-y-4 md:grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] md:gap-x-3">
        <p data-scroll-reveal aria-live="polite" aria-atomic="true" className="text-xs tabular-nums text-muted-foreground md:col-span-3 md:text-right">
          {String(current + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </p>
        {projects.length > 1 ? (
          <>
            <button data-scroll-reveal type="button" aria-label="이전 대표 프로젝트" onClick={() => selectProject(current - 1)} className="grid size-11 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-start-1 md:row-start-2">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button data-scroll-reveal type="button" aria-label="다음 대표 프로젝트" onClick={() => selectProject(current + 1)} className="grid size-11 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-start-3 md:row-start-2">
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <div className="col-span-3 min-w-0 md:col-span-1 md:col-start-2 md:row-start-2">
          <div
            ref={viewport}
            tabIndex={0}
            aria-label="프로젝트 슬라이드"
            className="home-project-track flex snap-x snap-mandatory overflow-x-auto rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onScroll={(event) => setCurrent(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                selectProject(current + (event.key === "ArrowRight" ? 1 : -1));
              }
            }}
          >
            {projects.map((project, index) => (
              <div key={project.slug} role="group" aria-roledescription="slide" aria-hidden={index !== current} aria-label={`${index + 1} / ${projects.length}: ${project.title}`} className="grid min-w-0 shrink-0 basis-full snap-start items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-8">
                <Link data-scroll-reveal href={getPortfolioPath(project)} tabIndex={index === current ? 0 : -1} className="relative block aspect-video overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" aria-label={`${project.title} 상세 보기`}>
                  {project.images?.[0] ? (
                    <Image src={project.images[0]} alt={`${project.title} 썸네일`} fill sizes="(max-width: 767px) 100vw, 420px" className="object-cover" draggable={false} />
                  ) : null}
                </Link>
                <div data-scroll-reveal className="min-w-0">
                  <p className="text-xs leading-5 text-muted-foreground">{project.period}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Link href={getPortfolioPath(project)} tabIndex={index === current ? 0 : -1} className="rounded-sm hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{project.resume?.title ?? project.title}</Link>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{project.resume?.service ?? project.summary}</p>
                  <p className="mt-5 text-xs leading-6 text-muted-foreground">{project.myRole?.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {projects.length > 1 ? (
        <div data-scroll-reveal className="mt-2 flex items-center justify-center" aria-label="대표 프로젝트 선택">
          {projects.map((project, index) => (
            <button key={project.slug} type="button" onClick={() => selectProject(index)} aria-label={`${project.title} 보기`} aria-current={index === current ? "true" : undefined} className="flex h-11 min-w-6 cursor-pointer items-center justify-center rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span aria-hidden="true" className={`h-1.5 rounded-full bg-[var(--scrollbar-thumb)] transition-[width,opacity] ${index === current ? "w-5" : "w-1.5 opacity-40"}`} />
            </button>
          ))}
        </div>
      ) : null}
      {projects.map((project, index) => (
        <div key={project.slug} hidden={index !== current}>{details[project.slug]}</div>
      ))}
    </div>
  );
}
