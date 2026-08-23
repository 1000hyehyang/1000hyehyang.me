import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioFrontmatter } from "@/types";
import { ResumeReveal } from "./ResumeReveal";
import { ResumeSection } from "./ResumeSection";

type ProjectSectionProps = {
  projects: readonly PortfolioFrontmatter[];
};

function ProjectItem({ project }: { project: PortfolioFrontmatter }) {
  const details = project.resume;

  if (!details) return null;

  const href = `/portfolio/${project.category}/${project.slug}`;

  return (
    <article className="min-w-0">
      <Link
        href={href}
        className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${project.title} 상세 보기`}
      >
        <Image
          src={details.logo}
          alt={`${details.title} 로고`}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-lg object-contain"
        />
        <div className="inline-flex items-center gap-1.5 text-foreground transition-colors group-hover:text-brand">
          <h3 className="text-base font-semibold underline underline-offset-[6px]">
            [{details.context}] {details.title}
          </h3>
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </div>
      </Link>

      <dl className="mt-4 space-y-3">
        <ProjectDetail label="일정">{project.period}</ProjectDetail>
        <ProjectDetail label="기술 스택">
          {details.tech.join(" · ")}
        </ProjectDetail>
        <ProjectDetail label="참여 인력">{details.team}</ProjectDetail>
        <ProjectDetail label="서비스 소개">{details.service}</ProjectDetail>
        <ProjectDetail label="인프라 설계 기준">
          {details.infrastructureCriteria}
        </ProjectDetail>
      </dl>

      <ul className="mt-5 space-y-4">
        {details.highlights.map((highlight) =>
          typeof highlight === "string" ? (
            <li
              key={highlight}
              className="flex items-start text-xs leading-5 text-muted-foreground"
            >
              <span aria-hidden="true" className="mr-2 text-brand">
                •
              </span>
              <span>{highlight}</span>
            </li>
          ) : (
            <li key={highlight.title}>
              <div className="flex items-start text-xs font-semibold leading-5 text-foreground">
                <span aria-hidden="true" className="mr-2 text-brand">
                  •
                </span>
                <span>{highlight.title}</span>
              </div>
              <ul className="mt-2 space-y-2 pl-4">
                {highlight.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start text-xs leading-5 text-muted-foreground"
                  >
                    <span aria-hidden="true" className="mr-2 text-brand/70">
                      -
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
    </article>
  );
}

function ProjectDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 text-xs sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="font-medium leading-5 text-foreground">{label}</dt>
      <dd className="leading-5 text-muted-foreground">{children}</dd>
    </div>
  );
}

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <ResumeSection id="projects" title="Projects." revealContent={false}>
      <div className="space-y-12">
        {projects.map((project) => (
          <ResumeReveal key={project.slug}>
            <ProjectItem project={project} />
          </ResumeReveal>
        ))}
      </div>
    </ResumeSection>
  );
}
