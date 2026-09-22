import type { ReactNode } from "react";
import type { PortfolioFrontmatter } from "@/types";
import { ProjectCarousel } from "./ProjectCarousel";
import { ProjectAccordion } from "./ProjectAccordion";
import { ResumeSection } from "./ResumeSection";

type ProjectSectionProps = {
  projects: readonly PortfolioFrontmatter[];
};

function ProjectItem({ project }: { project: PortfolioFrontmatter }) {
  const details = project.resume;

  return (
    <article aria-label={project.title} className="min-w-0">
      {details ? (
        <>
          <ProjectAccordion title="프로젝트 정보" context={details.context}>
            <dl className="mt-2 space-y-3 pb-6">
              <ProjectDetail label="일정">{project.period}</ProjectDetail>
              <ProjectDetail label="기술 스택">
                {details.tech.join(" · ")}
              </ProjectDetail>
              <ProjectDetail label="참여 인력">{details.team}</ProjectDetail>
              <ProjectDetail label="서비스 소개">{details.service}</ProjectDetail>
              {details.infrastructureCriteria && (
                <ProjectDetail label="인프라 설계 기준">
                  {details.infrastructureCriteria}
                </ProjectDetail>
              )}
            </dl>
          </ProjectAccordion>
          <ProjectAccordion title="구현 내용">
            <ul className="space-y-4 pb-6">
              {details.highlights.map((highlight) =>
                typeof highlight === "string" ? (
                  <li
                    data-scroll-reveal
                    key={highlight}
                    className="flex items-start text-xs leading-5 text-muted-foreground"
                  >
                    <span aria-hidden="true" className="mr-2 text-brand">
                      •
                    </span>
                    <span>{highlight}</span>
                  </li>
                ) : (
                  <li data-scroll-reveal key={highlight.title}>
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
          </ProjectAccordion>
        </>
      ) : null}
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
    <div data-scroll-reveal className="grid gap-1 text-xs sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="font-medium leading-5 text-foreground">{label}</dt>
      <dd className="leading-5 text-muted-foreground">{children}</dd>
    </div>
  );
}

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <ResumeSection id="projects" title="Projects.">
      <ProjectCarousel
        projects={projects}
        details={Object.fromEntries(
          projects.map((project) => [
            project.slug,
            <ProjectItem key={project.slug} project={project} />,
          ]),
        )}
      />
    </ResumeSection>
  );
}
