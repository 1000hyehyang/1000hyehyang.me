import Image from "next/image";
import type { ResumeEntry } from "@/types";
import { ResumeSection } from "./ResumeSection";

type TimelineSectionProps = {
  id: string;
  title: string;
  items: readonly ResumeEntry[];
};

function TimelineCard({ item }: { item: ResumeEntry }) {
  return (
    <article className="w-full rounded-lg bg-muted/25 p-4 dark:bg-muted/40">
      <p className="mb-1 text-xs text-muted-foreground">{item.period}</p>
      <div className="mb-1 flex items-center gap-2">
        <div className="relative size-6 shrink-0">
          <Image
            src={item.logo}
            alt={item.logoAlt}
            fill
            sizes="24px"
            className="rounded-xs object-contain"
          />
        </div>
        <h3 className="text-sm font-semibold">{item.title}</h3>
      </div>
      {item.issuer ? (
        <p className="mb-1 text-xs text-foreground">- {item.issuer}</p>
      ) : null}
      {item.description ? (
        <p className="text-xs text-muted-foreground">{item.description}</p>
      ) : null}
    </article>
  );
}

export function TimelineSection({ id, title, items }: TimelineSectionProps) {
  return (
    <ResumeSection id={id} title={title}>
      <div className="space-y-6">
        {items.map((item) => (
          <TimelineCard key={`${item.title}-${item.period}`} item={item} />
        ))}
      </div>
    </ResumeSection>
  );
}
