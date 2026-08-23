import Image from "next/image";
import type { ResumeEntry } from "@/types";
import { ResumeSection } from "./ResumeSection";

type ExperienceSectionProps = {
  id: string;
  title: string;
  items: readonly ResumeEntry[];
  spacing?: "default" | "relaxed";
};

const spacingClassNames = {
  default: "space-y-6",
  relaxed: "space-y-8",
} as const;

function ExperienceCard({ item }: { item: ResumeEntry }) {
  const titleClassName =
    "mb-1 text-sm font-semibold text-foreground transition-colors";

  return (
    <article className="flex items-start gap-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-logo-border bg-logo-surface">
        <Image
          src={item.logo}
          alt={item.logoAlt}
          width={64}
          height={64}
          className="size-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${titleClassName} cursor-pointer hover:text-brand`}
            >
              {item.title}
            </a>
          ) : (
            <span className={titleClassName}>{item.title}</span>
          )}
        </h3>
        {item.description ? (
          <p className="mb-2 text-xs text-muted-foreground">{item.description}</p>
        ) : null}
        <p className="mb-3 text-xs text-muted-foreground">{item.period}</p>

        {item.activities?.length ? (
          <ul className="space-y-1">
            {item.activities.map((activity) => (
              <li
                key={activity}
                className="flex items-start text-xs text-muted-foreground"
              >
                <span aria-hidden="true" className="mr-2 text-brand">
                  •
                </span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export function ExperienceSection({
  id,
  title,
  items,
  spacing = "default",
}: ExperienceSectionProps) {
  return (
    <ResumeSection id={id} title={title}>
      <div className={spacingClassNames[spacing]}>
        {items.map((item) => (
          <ExperienceCard key={`${item.title}-${item.period}`} item={item} />
        ))}
      </div>
    </ResumeSection>
  );
}
