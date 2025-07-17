import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogFrontmatter, PortfolioFrontmatter } from "@/types";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const BLOG_PATH = path.join(process.cwd(), "src/content/blog");
const PORTFOLIO_PATH = path.join(process.cwd(), "src/content/portfolio");

export const getAllBlogPosts = (): BlogFrontmatter[] => {
  const files = fs.readdirSync(BLOG_PATH);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(BLOG_PATH, file);
      const source = fs.readFileSync(filePath, "utf8");
      const { data } = matter(source);
      return {
        ...(data as BlogFrontmatter),
        slug: data.slug || file.replace(/\.mdx$/, ""),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getBlogPostBySlug = (slug: string): { frontmatter: BlogFrontmatter; content: string } | null => {
  const files = fs.readdirSync(BLOG_PATH);
  const file = files.find((f) => f.replace(/\.mdx$/, "") === slug);
  if (!file) return null;
  const filePath = path.join(BLOG_PATH, file);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return {
    frontmatter: { ...(data as BlogFrontmatter), slug },
    content,
  };
};

export const getAllPortfolio = (): PortfolioFrontmatter[] => {
  const files = fs.readdirSync(PORTFOLIO_PATH);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(PORTFOLIO_PATH, file);
      const source = fs.readFileSync(filePath, "utf8");
      const { data } = matter(source);
      return {
        ...(data as PortfolioFrontmatter),
        slug: data.slug || file.replace(/\.mdx$/, ""),
      };
    })
    .sort((a, b) => (a.period < b.period ? 1 : -1));
};

export const getPortfolioBySlug = (slug: string): { frontmatter: PortfolioFrontmatter; content: string } | null => {
  const files = fs.readdirSync(PORTFOLIO_PATH);
  const file = files.find((f) => f.replace(/\.mdx$/, "") === slug);
  if (!file) return null;
  const filePath = path.join(PORTFOLIO_PATH, file);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return {
    frontmatter: { ...(data as PortfolioFrontmatter), slug },
    content,
  };
};

export const getMdxSource = async (mdxContent: string) => {
  return await serialize(mdxContent, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
      format: "mdx"
    },
  });
}; 