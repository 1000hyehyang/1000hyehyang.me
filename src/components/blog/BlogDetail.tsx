import { BlogFrontmatter } from "@/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Giscus from "@giscus/react";
import Link from "next/link";

const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO! as `${string}/${string}`;
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID!;
const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY!;
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!;

interface BlogDetailProps {
  frontmatter: BlogFrontmatter;
  mdxSource: MDXRemoteSerializeResult;
}

export const BlogDetail = ({ frontmatter, mdxSource }: BlogDetailProps) => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="font-bold text-2xl mb-2">{frontmatter.title}</h1>
      <div className="text-sm text-muted-foreground mb-4 flex gap-2 items-center">
        <span>{frontmatter.category}</span>
        <span>·</span>
        <span>{frontmatter.date}</span>
        {frontmatter.tags && (
          <span className="ml-2 flex flex-wrap gap-1">
            {frontmatter.tags.map((tag) => (
              <span key={tag} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
            ))}
          </span>
        )}
      </div>
      {frontmatter.thumbnail && (
        <img src={frontmatter.thumbnail} alt={frontmatter.title} className="rounded-lg mb-6 w-full max-h-80 object-cover" />
      )}
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
          theme="preferred_color_scheme"
          lang="ko"
          loading="lazy"
        />
      </div>
      <div className="mt-6 flex gap-2">
        <Link href="/blog" className="text-primary underline">← 블로그 목록</Link>
        <button
          type="button"
          className="text-muted-foreground underline"
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          공유
        </button>
      </div>
    </article>
  );
}; 