import Image from "next/image";
import type { ResumeEntry } from "@/types";

type CredentialGroupProps = {
  title: string;
  items: readonly ResumeEntry[];
};

function CredentialCard({ item }: { item: ResumeEntry }) {
  return (
    <article data-scroll-reveal className="min-w-0 rounded-lg bg-muted/25 p-3 [overflow-wrap:anywhere] transition-colors duration-200 hover:bg-muted/40 dark:bg-muted/40 dark:hover:bg-muted/60 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative size-6 shrink-0 sm:size-8">
          <Image
            src={item.logo}
            alt={item.logoAlt}
            fill
            sizes="(max-width: 639px) 24px, 32px"
            className="rounded-sm object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-keep text-xs font-semibold sm:text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.period}</p>
        </div>
      </div>
      {item.description ? (
        <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
      ) : null}
    </article>
  );
}

export function CredentialGroup({
  title,
  items,
}: CredentialGroupProps) {
  return (
    <div>
      <h3 data-scroll-reveal className="mb-3 text-base font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-3 min-[320px]:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <CredentialCard key={`${item.title}-${item.period}`} item={item} />
        ))}
      </div>
    </div>
  );
}
