import type {
  PortfolioFilter,
  PortfolioFrontmatter,
} from "@/types";

export const PORTFOLIO_FILTERS: readonly PortfolioFilter[] = [
  "total",
  "dev",
  "hackathons",
  "design",
];

const PORTFOLIO_FILTER_SET = new Set<PortfolioFilter>(PORTFOLIO_FILTERS);

export function parsePortfolioFilter(
  value: string | null | undefined,
): PortfolioFilter {
  const normalized = value?.toLowerCase();

  if (
    normalized &&
    PORTFOLIO_FILTER_SET.has(normalized as PortfolioFilter)
  ) {
    return normalized as PortfolioFilter;
  }

  // Keep old hackathon links working while collapsing the former generic
  // project category into the new default archive view.
  if (normalized === "hackathon") return "hackathons";
  return "total";
}

export function getPortfolioStartTime(period: string): number {
  const match = period.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
  if (!match) return 0;

  const [, year, month, day] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

export function sortPortfolioNewestFirst(
  projects: readonly PortfolioFrontmatter[],
): PortfolioFrontmatter[] {
  return [...projects].sort(
    (a, b) => getPortfolioStartTime(b.period) - getPortfolioStartTime(a.period),
  );
}

export function isPortfolioInFilter(
  project: PortfolioFrontmatter,
  filter: PortfolioFilter,
): boolean {
  if (filter === "total") return true;
  if (filter === "hackathons") return project.category === "hackathon";
  return project.category === "project" && project.discipline === filter;
}

export function getPortfolioDisplayCategory(
  project: Pick<PortfolioFrontmatter, "category" | "discipline">,
): "Dev" | "Design" | "Hackathon" | "Project" {
  if (project.category === "hackathon") return "Hackathon";
  if (project.discipline === "dev") return "Dev";
  if (project.discipline === "design") return "Design";
  return "Project";
}
