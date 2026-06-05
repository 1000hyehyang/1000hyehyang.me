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
        const subFiles = readMdxFilesRecursively(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && item.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`디렉토리 읽기 실패 ${directoryPath}:`, error);
  }
  return files;
};

const parseMdxFile = (filePath: string) => {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);
    return { data, content };
  } catch (error) {
    console.warn(`파일 파싱 실패 ${filePath}:`, error);
    return null;
  }
};

function hasSlug(data: unknown): data is { slug: string } {
  return typeof data === "object" && data !== null && "slug" in data && typeof (data as { slug?: unknown }).slug === "string";
}

export const getAllPortfolio = (): PortfolioFrontmatter[] => {
  const files = readMdxFilesRecursively(PORTFOLIO_PATH);
  return files
    .map((filePath) => {
      const parsed = parseMdxFile(filePath);
      if (!parsed) return null;
      const { data } = parsed;
      const relativePath = path.relative(PORTFOLIO_PATH, filePath).replace(/\\/g, '/');
      const parts = relativePath.split('/').filter(Boolean);
      const category = parts[0];
      if (!hasSlug(data)) return null;
      const slug = data.slug;
      return {
        ...(data as PortfolioFrontmatter),
        slug,
        category,
      };
    })
    .filter((project): project is PortfolioFrontmatter => project !== null)
    .sort((a, b) => {
      // 먼저 카테고리로 정렬 (project가 hackathon보다 먼저)
      const categoryOrder = { project: 0, hackathon: 1 };
      const categoryDiff = categoryOrder[a.category as keyof typeof categoryOrder] - categoryOrder[b.category as keyof typeof categoryOrder];
      
      if (categoryDiff !== 0) {
        return categoryDiff;
      }
      
      // 같은 카테고리 내에서는 날짜 순으로 정렬 (최신순)
      return new Date(b.period.split(" - ")[0]).getTime() - new Date(a.period.split(" - ")[0]).getTime();
    });
};

export const getPortfolioBySlug = (
  category: "project" | "hackathon",
  slug: string
): { frontmatter: PortfolioFrontmatter; content: string } | null => {
  const dirPath = path.join(process.cwd(), "src/content/portfolio", category);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const parsed = parseMdxFile(filePath);
    if (parsed && hasSlug(parsed.data) && parsed.data.slug === slug) {
      return {
        frontmatter: parsed.data as PortfolioFrontmatter,
        content: parsed.content,
      };
    }
  }
  return null;
}; 