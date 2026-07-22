import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  PortfolioDiscipline,
  PortfolioFrontmatter,
  PortfolioRouteCategory,
} from "@/types";
import { sortPortfolioNewestFirst } from "@/lib/portfolio";

const PORTFOLIO_PATH = path.join(process.cwd(), "src/content/portfolio");
const ROUTE_CATEGORIES = new Set<PortfolioRouteCategory>([
  "project",
  "hackathon",
]);
const DISCIPLINES = new Set<PortfolioDiscipline>(["dev", "design"]);
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

type PortfolioDocument = {
  frontmatter: PortfolioFrontmatter;
  content: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPortfolioRouteCategory(
  value: string,
): value is PortfolioRouteCategory {
  return ROUTE_CATEGORIES.has(value as PortfolioRouteCategory);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function toFrontmatter(
  data: unknown,
  category: PortfolioRouteCategory,
): PortfolioFrontmatter | null {
  if (!isRecord(data)) return null;

  const { title, period, slug, tech } = data;
  if (
    typeof title !== "string" ||
    typeof period !== "string" ||
    typeof slug !== "string" ||
    !SAFE_SLUG_PATTERN.test(slug) ||
    !Array.isArray(tech) ||
    !tech.every((item) => typeof item === "string")
  ) {
    return null;
  }

  const discipline =
    typeof data.discipline === "string" &&
    DISCIPLINES.has(data.discipline as PortfolioDiscipline)
      ? (data.discipline as PortfolioDiscipline)
      : undefined;

  return {
    title,
    period,
    slug,
    tech,
    category,
    discipline,
    images: optionalStringArray(data.images),
    summary: optionalString(data.summary),
    githubUrl: optionalString(data.githubUrl),
    siteUrl: optionalString(data.siteUrl),
    pinned: data.pinned === true,
    categorizedTech: data.categorizedTech === true,
    teamMembers: optionalString(data.teamMembers),
    myRole: optionalString(data.myRole),
  };
}

function readMdxFilesRecursively(directoryPath: string): string[] {
  try {
    return fs.readdirSync(directoryPath, { withFileTypes: true }).flatMap((item) => {
      const fullPath = path.join(directoryPath, item.name);
      if (item.isDirectory()) return readMdxFilesRecursively(fullPath);
      return item.isFile() && item.name.endsWith(".mdx") ? [fullPath] : [];
    });
  } catch (error) {
    console.warn(`포트폴리오 디렉터리 읽기 실패 (${directoryPath}):`, error);
    return [];
  }
}

function readPortfolioDocument(
  filePath: string,
  category: PortfolioRouteCategory,
): PortfolioDocument | null {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);
    const frontmatter = toFrontmatter(data, category);

    if (!frontmatter) {
      console.warn(`유효하지 않은 포트폴리오 frontmatter: ${filePath}`);
      return null;
    }

    return { frontmatter, content };
  } catch (error) {
    console.warn(`포트폴리오 파일 파싱 실패 (${filePath}):`, error);
    return null;
  }
}

export function getAllPortfolio(): PortfolioFrontmatter[] {
  const projects = readMdxFilesRecursively(PORTFOLIO_PATH).flatMap((filePath) => {
    const relativePath = path.relative(PORTFOLIO_PATH, filePath);
    const [category] = relativePath.split(path.sep);
    if (!isPortfolioRouteCategory(category)) return [];

    const document = readPortfolioDocument(filePath, category);
    return document ? [document.frontmatter] : [];
  });

  return sortPortfolioNewestFirst(projects);
}

export function getPortfolioBySlug(
  category: string,
  slug: string,
): PortfolioDocument | null {
  if (!isPortfolioRouteCategory(category) || !SAFE_SLUG_PATTERN.test(slug)) {
    return null;
  }

  const directoryPath = path.join(PORTFOLIO_PATH, category);
  const files = readMdxFilesRecursively(directoryPath);

  for (const filePath of files) {
    const document = readPortfolioDocument(filePath, category);
    if (document?.frontmatter.slug === slug) return document;
  }

  return null;
}
