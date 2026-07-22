"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { TimelineItem } from "@/types";
import { AboutSection } from "./AboutSection";

type TimelineSectionProps = {
  id: string;
  title: string;
  items: readonly TimelineItem[];
};

function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full rounded-lg bg-muted/25 p-4 dark:bg-muted/40"
    >
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
      {item.description && (
        <p className="text-xs text-muted-foreground">{item.description}</p>
      )}
    </motion.article>
  );
}

export function TimelineSection({ id, title, items }: TimelineSectionProps) {
  return (
    <AboutSection id={id} title={title}>
      <div className="space-y-6">
        {items.map((item, index) => (
          <TimelineCard
            key={`${item.title}-${item.period}`}
            item={item}
            index={index}
          />
        ))}
      </div>
    </AboutSection>
  );
}
