"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { TimelineItem } from "@/types";
import { AboutSection } from "./AboutSection";

type ExperienceSectionProps = {
  id: string;
  title: string;
  items: readonly TimelineItem[];
  spacing?: "default" | "relaxed";
};

const spacingClassNames = {
  default: "space-y-6",
  relaxed: "space-y-8",
} as const;

function ExperienceCard({ item, index }: { item: TimelineItem; index: number }) {
  const titleClassName =
    "mb-1 text-sm font-semibold text-foreground transition-colors";

  return (
    <motion.article
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex items-start gap-4"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
              className={`${titleClassName} cursor-pointer hover:text-orange-300`}
            >
              {item.title}
            </a>
          ) : (
            <span className={titleClassName}>{item.title}</span>
          )}
        </h3>
        {item.description && (
          <p className="mb-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="mb-3 text-xs text-muted-foreground">{item.period}</p>

        {item.activities && item.activities.length > 0 && (
          <ul className="space-y-1">
            {item.activities.map((activity) => (
              <li key={activity} className="flex items-start text-xs text-muted-foreground">
                <span aria-hidden="true" className="mr-2 text-orange-300">
                  •
                </span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}

export function ExperienceSection({
  id,
  title,
  items,
  spacing = "default",
}: ExperienceSectionProps) {
  return (
    <AboutSection id={id} title={title}>
      <div className={spacingClassNames[spacing]}>
        {items.map((item, index) => (
          <ExperienceCard
            key={`${item.title}-${item.period}`}
            item={item}
            index={index}
          />
        ))}
      </div>
    </AboutSection>
  );
}
