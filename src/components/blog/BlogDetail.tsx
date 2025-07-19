"use client";

import { BlogFrontmatter } from "@/types";
import Image from "next/image";
import { GiscusComments } from "./GiscusComments";
import { useState } from "react";

interface BlogDetailProps {
  frontmatter: BlogFrontmatter;
  children: React.ReactNode;
}

export const BlogDetail = ({ frontmatter, children }: BlogDetailProps) => {
  const [imageError, setImageError] = useState(false);
  const [useOriginalUrl, setUseOriginalUrl] = useState(false);

  const handleImageError = () => {
    if (!useOriginalUrl && frontmatter.thumbnail?.includes('github.com/user-attachments/assets/')) {
      setUseOriginalUrl(true);
    } else {
      setImageError(true);
    }
  };

  const imageSrc = useOriginalUrl && frontmatter.thumbnail?.includes('github.com/user-attachments/assets/') 
    ? frontmatter.thumbnail 
    : frontmatter.thumbnail;

  const showImage = imageSrc && !imageError;

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="w-full aspect-[16/9] rounded-lg mb-6">
        {showImage ? (
          <Image 
            src={imageSrc} 
            alt={`${frontmatter.title} 썸네일`} 
            width={1200} 
            height={630} 
            className="w-full h-full object-cover rounded-lg" 
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-lg" />
        )}
      </div>
      {frontmatter.tags && frontmatter.tags.length > 0 && (
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