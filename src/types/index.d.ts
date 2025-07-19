export type BlogFrontmatter = {
  title: string;
  date: string;
  category: string;
  tags: string[];
  summary?: string;
  slug: string;
  author?: string;
  updatedAt?: string;
};

export type PortfolioFrontmatter = {
  title: string;
  period: string;
  tech: string[];
  role: string;
  links?: string[];
  images?: string[];
  summary?: string;
  slug: string;
};

export type Tag = string;
export type Category = string;

// 공통 타입들
export type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
  logo: string;
  logoAlt: string;
};

export type GiscusConfig = {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
}; 