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
    <div className="flex min-h-screen flex-col items-center pt-12">
      <ResumeHero />
      <ProjectSection projects={projects} />
      <ResumeHistory />
      <ContactSection />
    </div>
  );
}
