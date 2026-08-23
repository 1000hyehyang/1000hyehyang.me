import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ResumeReveal } from "./ResumeReveal";

type ResumeSectionProps = {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  showDivider?: boolean;
  revealContent?: boolean;
};

export function ResumeSection({
  id,
  title,
  children,
  className,
  showDivider = true,
  revealContent = true,
}: ResumeSectionProps) {
  const headingId = id && title ? `${id}-heading` : undefined;
  const content = revealContent ? (
    <ResumeReveal>{children}</ResumeReveal>
  ) : (
    children
  );

  return (
    <section
      aria-labelledby={headingId}
      className={cn("w-full max-w-2xl", className)}
    >
      {title ? (
        <ResumeReveal>
          <h2 id={headingId} className="mb-4 text-xl font-semibold">
            {title}
          </h2>
        </ResumeReveal>
      ) : null}
      <div className={title ? "mb-16" : undefined}>{content}</div>
      {showDivider ? <hr className="mb-16 border-t border-border/50" /> : null}
    </section>
  );
}
