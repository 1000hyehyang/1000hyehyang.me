import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogFrontmatter, PortfolioFrontmatter } from "@/types";

const BLOG_PATH = path.join(process.cwd(), "src/content/blog");
const PORTFOLIO_PATH = path.join(process.cwd(), "src/content/portfolio");

const readMdxFiles = (directoryPath: string): string[] => {
  try {
    return fs.readdirSync(directoryPath).filter((file) => file.endsWith(".mdx"));
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
    return [];
  }
};

const parseMdxFile = (filePath: string) => {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);
    return { data, content };
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return null;
  }
};

export const getAllBlogPosts = (): BlogFrontmatter[] => {
  const files = readMdxFiles(BLOG_PATH);
  
  return files
    .map((file) => {
      const filePath = path.join(BLOG_PATH, file);
      const parsed = parseMdxFile(filePath);
      if (!parsed) return null;
      
      const { data } = parsed;
      return {
        ...(data as BlogFrontmatter),
        slug: data.slug || file.replace(/\.mdx$/, ""),
      };
    })
    .filter((post): post is BlogFrontmatter => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = (slug: string): { frontmatter: BlogFrontmatter; content: string } | null => {
  const files = readMdxFiles(BLOG_PATH);
  const targetFile = files.find((file) => file.replace(/\.mdx$/, "") === slug);
  
  if (!targetFile) return null;
  
  const filePath = path.join(BLOG_PATH, targetFile);
  const parsed = parseMdxFile(filePath);
  if (!parsed) return null;
  
  const { data, content } = parsed;
  return {
    frontmatter: { ...(data as BlogFrontmatter), slug },
    content,
  };
};

export const getAllPortfolio = (): PortfolioFrontmatter[] => {
  const files = readMdxFiles(PORTFOLIO_PATH);
  
  return files
    .map((file) => {
      const filePath = path.join(PORTFOLIO_PATH, file);
      const parsed = parseMdxFile(filePath);
      if (!parsed) return null;
      
      const { data } = parsed;
      return {
        ...(data as PortfolioFrontmatter),
        slug: data.slug || file.replace(/\.mdx$/, ""),
      };
    })
    .filter((project): project is PortfolioFrontmatter => project !== null)
    .sort((a, b) => new Date(b.period.split(" - ")[0]).getTime() - new Date(a.period.split(" - ")[0]).getTime());
};

export const getPortfolioBySlug = (slug: string): { frontmatter: PortfolioFrontmatter; content: string } | null => {
  const files = readMdxFiles(PORTFOLIO_PATH);
  const targetFile = files.find((file) => file.replace(/\.mdx$/, "") === slug);
  
  if (!targetFile) return null;
  
  const filePath = path.join(PORTFOLIO_PATH, targetFile);
  const parsed = parseMdxFile(filePath);
  if (!parsed) return null;
  
  const { data, content } = parsed;
  return {
    frontmatter: { ...(data as PortfolioFrontmatter), slug },
    content,
  };
}; 