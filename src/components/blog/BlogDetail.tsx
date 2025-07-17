"use client";

import { BlogFrontmatter } from "@/types";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const MDXRemote = dynamic(() => import("next-mdx-remote").then(mod => ({ default: mod.MDXRemote })), {
  ssr: false,
  loading: () => <div className="animate-pulse">콘텐츠 로딩 중...</div>
});

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center text-muted-foreground">댓글 로딩 중...</div>
});

const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO! as `${string}/${string}`;
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID!;
const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY!;
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!;

interface BlogDetailProps {
  frontmatter: BlogFrontmatter;
  mdxSource: MDXRemoteSerializeResult;
}

export const BlogDetail = ({ frontmatter, mdxSource }: BlogDetailProps) => {
  const { theme } = useTheme();

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
      <MDXRemote {...mdxSource} />
      <div className="mt-8">
        <Giscus
          id="comments"
          repo={GISCUS_REPO}
          repoId={GISCUS_REPO_ID}
          category={GISCUS_CATEGORY}
          categoryId={GISCUS_CATEGORY_ID}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme === "dark" ? "dark" : "light"}
          lang="ko"
          loading="lazy"
        />
      </div>
    </article>
  );
}; 