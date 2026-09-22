import type { ReactNode } from "react";
import { ResumeReveal } from "./ResumeReveal";

type ResumeSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  revealContent?: boolean;
};

export function ResumeSection({
  id,
  title,
  children,
  revealContent = true,
}: ResumeSectionProps) {
  const headingId = `${id}-heading`;
  const content = revealContent ? (
    <ResumeReveal>{children}</ResumeReveal>
  ) : (
    children
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="portfolio-split-grid w-full scroll-mt-24 py-12 sm:py-16 lg:py-20 border-t border-border/60"
    >
      <ResumeReveal>
        <h2 id={headingId} className="text-2xl font-semibold tracking-[-0.025em]">
          {title}
        </h2>
      </ResumeReveal>
      <div className="min-w-0">{content}</div>
    </section>
  );
}
