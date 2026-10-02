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
      className="grid w-full scroll-mt-24 gap-6 border-t border-border/60 py-12 first-of-type:border-t-0 first-of-type:pt-0 sm:gap-8 sm:py-16 lg:py-20"
    >
      <h2 data-scroll-reveal id={headingId} className="text-2xl font-semibold tracking-[-0.025em]">
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
