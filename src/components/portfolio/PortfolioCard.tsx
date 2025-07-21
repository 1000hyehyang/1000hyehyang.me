"use client";

import { PortfolioCardProps } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export const PortfolioCard = ({ title, period, images, summary, slug, category, variants }: PortfolioCardProps) => {
  // category에 따라 링크 경로 결정
  const linkHref = `/portfolio/${category}/${slug}`;

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={variants}
      className="bg-card border border-border overflow-hidden cursor-pointer rounded-lg hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors"
    >
      <Link 
        href={linkHref} 
        tabIndex={0} 
        aria-label={`${title} 상세 보기`} 
        className="flex flex-col h-full p-4 focus:outline-none"
      >
        <div className="text-xs text-muted-foreground mb-2">
          {period}
        </div>
        {images && images[0] && (
          <Image
            src={images[0]}
            alt={`${title} 썸네일`}
            width={600}
            height={300}
            className="w-full aspect-[3/1.5] object-cover rounded-lg mb-3"
            unoptimized
            priority
          />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <h2 className="font-semibold text-lg mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground mb-1">{summary}</p>
        </div>
      </Link>
    </motion.article>
  );
}; 