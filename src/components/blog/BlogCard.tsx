"use client"

import { BlogFrontmatter } from "@/types";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

interface BlogCardProps extends BlogFrontmatter {
  variants?: Variants;
}

export const BlogCard = ({ title, date, category, tags, summary, slug, variants }: BlogCardProps) => {
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
      className="bg-card border border-border overflow-hidden cursor-pointer rounded-lg hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors"
    >
      <Link 
        href={`/blog/${slug}`} 
        tabIndex={0} 
        aria-label={`${title} 상세 보기`} 
        className="flex flex-col h-full p-6 focus:outline-none focus:ring-2 focus:ring-ring"
        onKeyDown={handleKeyDown}
      >
        <div className="flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground mb-3 flex gap-2 items-center">
            <span>{category}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          <h2 className="font-bold text-xl line-clamp-2 mb-3 leading-tight">{title}</h2>
          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{summary}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {tags.map((tag) => (
                <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}; 