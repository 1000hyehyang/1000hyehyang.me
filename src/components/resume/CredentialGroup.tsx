import Image from "next/image";
import type { ResumeEntry } from "@/types";

type CredentialGroupProps = {
  title: string;
  items: readonly ResumeEntry[];
};

function CredentialCard({ item }: { item: ResumeEntry }) {
  return (
    <article className="rounded-lg bg-muted/25 p-4 transition-colors duration-200 hover:bg-muted/40 dark:bg-muted/40 dark:hover:bg-muted/60">
      <div className="flex items-center gap-3">
        <div className="relative size-8 shrink-0">
          <Image
            src={item.logo}
            alt={item.logoAlt}
            fill
            sizes="32px"
            className="rounded-sm object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-keep text-sm font-semibold">{item.title}</p>
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
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CredentialCard key={`${item.title}-${item.period}`} item={item} />
        ))}
      </div>
    </div>
  );
}
