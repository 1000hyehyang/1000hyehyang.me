import { PortfolioFrontmatter } from "@/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface PortfolioDetailProps {
  frontmatter: PortfolioFrontmatter;
  mdxSource: MDXRemoteSerializeResult;
}

export const PortfolioDetail = ({ frontmatter, mdxSource }: PortfolioDetailProps) => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="font-bold text-2xl mb-2">{frontmatter.title}</h1>
      <div className="text-sm text-muted-foreground mb-4 flex gap-2 items-center">
        <span>{frontmatter.period}</span>
        <span>·</span>
        <span>{frontmatter.role}</span>
        {frontmatter.tech && (
          <span className="ml-2 flex flex-wrap gap-1">
            {frontmatter.tech.map((t) => (
              <span key={t} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">{t}</span>
            ))}
          </span>
        )}
      </div>
      {frontmatter.images && frontmatter.images.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {frontmatter.images.map((img) => (
            <img key={img} src={img} alt={frontmatter.title} className="rounded-lg w-48 h-32 object-cover" />
          ))}
        </div>
      )}
      <MDXRemote {...mdxSource} />
      {frontmatter.links && frontmatter.links.length > 0 && (
        <div className="mt-6 flex gap-2 flex-wrap">
          {frontmatter.links.map((link) => (
            <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline">관련 링크</a>
          ))}
        </div>
      )}
    </article>
  );
}; 