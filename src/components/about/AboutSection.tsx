import type { ReactNode } from "react";

type AboutSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  showDivider?: boolean;
};

export function AboutSection({
  id,
  title,
  children,
  showDivider = true,
}: AboutSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-4 text-xl font-semibold">
        {title}
      </h2>
      <div className="mb-16">{children}</div>
      {showDivider && <hr className="mb-16 border-t border-border/50" />}
    </section>
  );
}
