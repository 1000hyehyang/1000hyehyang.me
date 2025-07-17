import { PortfolioFrontmatter } from "@/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";

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
            {frontmatter.tech.map((tech) => (
              <span key={tech} className="bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs">{tech}</span>
            ))}
          </span>
        )}
      </div>
      {frontmatter.images && frontmatter.images.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {frontmatter.images.map((image, index) => (
            <Image 
              key={image} 
              src={image} 
              alt={`${frontmatter.title} 이미지 ${index + 1}`} 
              width={192} 
              height={128} 
              className="rounded-lg w-48 h-32 object-cover" 
            />
          ))}
        </div>
      )}
      <MDXRemote {...mdxSource} />
      {frontmatter.links && frontmatter.links.length > 0 && (
        <div className="mt-6 flex gap-2 flex-wrap">
          {frontmatter.links.map((link, index) => (
            <a 
              key={link} 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary underline"
              aria-label={`${frontmatter.title} 관련 링크 ${index + 1}`}
            >
              관련 링크
            </a>
          ))}
        </div>
      )}
    </article>
  );
}; 