"use client"

import { BlogFrontmatter } from "@/types";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface BlogCardProps extends BlogFrontmatter {
  variants?: Variants;
}

export const BlogCard = ({ title, date, category, tags, thumbnail, summary, slug, variants }: BlogCardProps) => {
  const [imageError, setImageError] = useState(false);
  
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
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="bg-card overflow-hidden cursor-pointer rounded-lg"
    >
      <Link 
        href={`/blog/${slug}`} 
        tabIndex={0} 
        aria-label={`${title} 상세 보기`} 
        className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-ring group"
        onKeyDown={handleKeyDown}
      >
        <div className="w-full h-56 p-2">
          <div className="w-full h-full aspect-square">
            {thumbnail && !imageError ? (
              <Image 
                src={thumbnail} 
                alt={`${title} 썸네일`} 
                width={400} 
                height={400} 
                className="w-full h-full object-cover rounded-md" 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-md" />
            )}
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-xs text-muted-foreground mb-2 flex gap-2 items-center">
            <span>{category}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          <h2 className="font-bold text-lg line-clamp-2 mb-2 leading-tight group-hover:text-orange-300 transition-colors">{title}</h2>
          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{summary}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag) => (
              <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}; 