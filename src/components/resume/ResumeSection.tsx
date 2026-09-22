import type { ReactNode } from "react";

type ResumeSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function ResumeSection({
  id,
  title,
  children,
}: ResumeSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="portfolio-split-grid w-full scroll-mt-24 py-12 sm:py-16 lg:py-20 border-t border-border/60"
    >
      <div>
        <h2 data-scroll-reveal id={headingId} className="text-2xl font-semibold tracking-[-0.025em]">
          {title}
        </h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
