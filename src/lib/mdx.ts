import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PortfolioFrontmatter } from "@/types";

const PORTFOLIO_PATH = path.join(process.cwd(), "src/content/portfolio");

const readMdxFilesRecursively = (directoryPath: string): string[] => {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(directoryPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directoryPath, item.name);
      
      if (item.isDirectory()) {
        // 재귀적으로 하위 디렉토리 탐색
        const subFiles = readMdxFilesRecursively(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && item.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
  }
  
  return files;
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

export const getAllPortfolio = (): PortfolioFrontmatter[] => {
  const files = readMdxFilesRecursively(PORTFOLIO_PATH);
  
  return files
    .map((filePath) => {
      const parsed = parseMdxFile(filePath);
      if (!parsed) return null;
      
      const { data } = parsed;
      const relativePath = path.relative(PORTFOLIO_PATH, filePath);
      // 파일 경로 기반으로 slug 생성 (project/ururu.mdx -> project/ururu)
      const slug = relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/");
      
      return {
        ...(data as PortfolioFrontmatter),
        slug,
      };
    })
    .filter((project): project is PortfolioFrontmatter => project !== null)
    .sort((a, b) => new Date(b.period.split(" - ")[0]).getTime() - new Date(a.period.split(" - ")[0]).getTime());
};

export const getPortfolioBySlug = (slug: string): { frontmatter: PortfolioFrontmatter; content: string } | null => {
  const files = readMdxFilesRecursively(PORTFOLIO_PATH);
  
  const targetFile = files.find((filePath) => {
    const relativePath = path.relative(PORTFOLIO_PATH, filePath);
    const fileSlug = relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/");
    return fileSlug === slug;
  });
  
  if (!targetFile) return null;
  
  const parsed = parseMdxFile(targetFile);
  if (!parsed) return null;
  
  const { data, content } = parsed;
  const relativePath = path.relative(PORTFOLIO_PATH, targetFile);
  const actualSlug = relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/");
  
  return {
    frontmatter: { ...(data as PortfolioFrontmatter), slug: actualSlug },
    content,
  };
}; 