"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { TimelineItem } from "@/types";
import { AboutSection } from "./AboutSection";

type CredentialSectionProps = {
  id: string;
  title: string;
  items: readonly TimelineItem[];
  columns?: 3 | 4;
  showDivider?: boolean;
};

const columnClassNames = {
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
} as const;

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function CredentialCard({ item }: { item: TimelineItem }) {
  return (
    <motion.article
      variants={cardVariants}
      transition={{ duration: 0.6 }}
      className="rounded-lg bg-muted/25 p-4 transition-all duration-200 hover:scale-105 hover:bg-muted/40 dark:bg-muted/40 dark:hover:bg-muted/60"
    >
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
          <h3 className="whitespace-nowrap text-sm font-semibold">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{item.period}</p>
        </div>
      </div>
      {item.description && (
        <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
      )}
    </motion.article>
  );
}

export function CredentialSection({
  id,
  title,
  items,
  columns = 4,
  showDivider = true,
}: CredentialSectionProps) {
  return (
    <AboutSection id={id} title={title} showDivider={showDivider}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={gridVariants}
        className={`grid gap-4 ${columnClassNames[columns]}`}
      >
        {items.map((item) => (
          <CredentialCard key={`${item.title}-${item.period}`} item={item} />
        ))}
      </motion.div>
    </AboutSection>
  );
}
