"use client";

import { PortfolioFrontmatter } from "@/types";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface PortfolioCardProps extends PortfolioFrontmatter {
  variants?: Variants;
}

export const PortfolioCard = ({ title, period, images, summary, slug, variants }: PortfolioCardProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const link = event.currentTarget as HTMLAnchorElement;
      link.click();
    }
  };

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={variants}
      className="p-4 bg-card border border-border overflow-hidden cursor-pointer rounded-lg hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors"
    >
      <Link 
        href={`/portfolio/${slug}`} 
        tabIndex={0} 
        aria-label={`${title} 상세 보기`} 
        className="flex flex-col h-full focus:outline-none"
        onKeyDown={handleKeyDown}
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
            priority
          />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <h2 className="font-bold text-lg mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground mb-1">{summary}</p>
        </div>
      </Link>
    </motion.article>
  );
}; 