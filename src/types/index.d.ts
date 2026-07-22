import type { ReactNode } from "react";

export type PortfolioRouteCategory = "project" | "hackathon";
export type PortfolioDiscipline = "dev" | "design";
export type PortfolioFilter = "total" | "dev" | "hackathons" | "design";

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
  myRole?: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
  logo: string;
  logoAlt: string;
  activities?: string[];
  url?: string;
};

export type PortfolioCardProps = PortfolioFrontmatter;

export type PortfolioDetailProps = {
  frontmatter: PortfolioFrontmatter;
  children: ReactNode;
};
