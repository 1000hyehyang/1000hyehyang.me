import type { PortfolioFrontmatter } from "@/types";
import { ContactSection } from "./ContactSection";
import { ProjectSection } from "./ProjectSection";
import { ResumeHero } from "./ResumeHero";
import { ResumeHistory } from "./ResumeHistory";
import { ResumeReveal } from "./ResumeReveal";

type ResumeContentProps = {
  projects: readonly PortfolioFrontmatter[];
};

export function ResumeContent({ projects }: ResumeContentProps) {
  return (
    <ResumeReveal>
      <ResumeHero />
      <ProjectSection projects={projects} />
      <ResumeHistory />
      <ContactSection />
    </ResumeReveal>
  );
}
