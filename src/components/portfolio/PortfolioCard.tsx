"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PortfolioCardProps } from "@/types";
import { getPortfolioDisplayCategory } from "@/lib/portfolio";

export function PortfolioCard({
  title,
  period,
  tech,
  images,
  summary,
  slug,
  category,
  discipline,
}: PortfolioCardProps) {
  const linkHref = `/portfolio/${category}/${slug}`;
  const displayCategory = getPortfolioDisplayCategory({ category, discipline });
  const visibleTech = tech.slice(0, 3);
  const overflowTechCount = tech.length - visibleTech.length;

  return (
    <motion.article
      className="group min-w-0"
    >
      <Link
        href={linkHref}
        aria-label={`${title} 상세 보기`}
        className="flex h-full min-w-0 flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {images?.[0] ? (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={images[0]}
              alt={`${title} 썸네일`}
              fill
              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 350px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-brand">{displayCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{period}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {title}
          </h3>
          {summary ? (
            <p className="mb-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {visibleTech.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {overflowTechCount > 0 ? <span>+{overflowTechCount}</span> : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
