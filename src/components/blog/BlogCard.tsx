"use client"

import { BlogFrontmatter } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export const BlogCard = ({ title, date, category, tags, thumbnail, summary, slug }: BlogFrontmatter) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      <Link href={`/blog/${slug}`} tabIndex={0} aria-label={`${title} 상세 보기`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-ring">
        {thumbnail && (
          <Image src={thumbnail} alt={title} width={600} height={320} className="w-full h-40 object-cover" />
        )}
        <div className="flex-1 flex flex-col gap-2 p-4">
          <div className="text-xs text-muted-foreground mb-1 flex gap-2 items-center">
            <span>{category}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          <h2 className="font-bold text-lg line-clamp-2 mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{summary}</p>
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