"use client";

import { BlogFrontmatter } from "@/types";
import { GiscusComments } from "./GiscusComments";

interface BlogDetailProps {
  frontmatter: BlogFrontmatter;
  children: React.ReactNode;
}

export const BlogDetail = ({ frontmatter, children }: BlogDetailProps) => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {frontmatter.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
          ))}
        </div>
      )}
      <h1 className="font-bold text-3xl mb-4">{frontmatter.title}</h1>
      <div className="text-sm text-muted-foreground mb-6 flex gap-2 items-center">
        <span>{frontmatter.category}</span>
        <span>·</span>
        <span>{frontmatter.date}</span>
        {frontmatter.author && (
          <>
            <span>·</span>
            <span>by {frontmatter.author}</span>
          </>
        )}
      </div>
      {children}
      <div className="mt-8">
        <GiscusComments />
      </div>
    </article>
  );
}; 