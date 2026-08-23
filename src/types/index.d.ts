import type { ReactNode } from "react";

export type PortfolioRouteCategory = "project" | "hackathon";
export type PortfolioDiscipline = "dev" | "design";
export type PortfolioFilter = "total" | "dev" | "hackathons" | "design";

export type PortfolioRole = {
  title: string;
  summary?: string;
  contributions: string[];
};

export type ResumeHighlightGroup = {
  title: string;
  items: string[];
};

export type ResumeProjectDetails = {
  context: string;
  title: string;
  logo: string;
  tech: string[];
  team: string;
  service: string;
  infrastructureCriteria: string;
  highlights: Array<string | ResumeHighlightGroup>;
};

export type PortfolioFrontmatter = {
  title: string;
  period: string;
  tech: string[];
  images?: string[];
  summary?: string;
  slug: string;
  githubUrl?: string;
  siteUrl?: string;
  category: PortfolioRouteCategory;
  discipline?: PortfolioDiscipline;
  pinned?: boolean;
  categorizedTech?: boolean;
  teamMembers?: string;
  myRole?: PortfolioRole;
  resume?: ResumeProjectDetails;
};

export type ResumeEntry = {
  period: string;
  title: string;
  description: string;
  issuer?: string;
  logo: string;
  logoAlt: string;
  activities?: string[];
  url?: string;
};

export type PortfolioCardProps = PortfolioFrontmatter;

export type PortfolioDetailProps = {
  frontmatter: PortfolioFrontmatter;
  children: ReactNode;
  infoContent?: ReactNode;
};
