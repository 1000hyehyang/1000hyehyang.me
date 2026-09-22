import type { PortfolioFrontmatter } from "@/types";
import { ContactSection } from "./ContactSection";
import { ProjectSection } from "./ProjectSection";
import { ResumeHero } from "./ResumeHero";
import { ResumeHistory } from "./ResumeHistory";

type ResumeContentProps = {
  projects: readonly PortfolioFrontmatter[];
};

export function ResumeContent({ projects }: ResumeContentProps) {
  return (
    <div className="w-full pb-8 pt-8 sm:pt-12 lg:pt-16">
      <ResumeHero />
      <ProjectSection projects={projects} />
      <ResumeHistory />
      <ContactSection />
    </div>
  );
}
