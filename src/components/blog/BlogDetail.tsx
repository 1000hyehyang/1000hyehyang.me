"use client";

import { BlogFrontmatter } from "@/types";
import Image from "next/image";
import { GiscusComments } from "./GiscusComments";

interface BlogDetailProps {
  frontmatter: BlogFrontmatter;
  children: React.ReactNode;
}

export const BlogDetail = ({ frontmatter, children }: BlogDetailProps) => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {frontmatter.thumbnail && (
        <Image 
          src={frontmatter.thumbnail} 
          alt={`${frontmatter.title} 썸네일`} 
          width={1200} 
          height={630} 
          className="rounded-lg mb-6 w-full aspect-[16/9] object-cover" 
        />
      )}
      {frontmatter.tags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {frontmatter.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
          ))}
        </div>
      )}
      <h1 className="font-bold text-2xl mb-2">{frontmatter.title}</h1>
      <div className="text-sm text-muted-foreground mb-4 flex gap-2 items-center">
        <span>{frontmatter.category}</span>
        <span>·</span>
        <span>{frontmatter.date}</span>
      </div>
      {children}
      <div className="mt-8">
        <GiscusComments />
      </div>
    </article>
  );
}; 