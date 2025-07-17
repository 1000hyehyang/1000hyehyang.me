export type BlogFrontmatter = {
  title: string;
  date: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  summary?: string;
  slug: string;
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