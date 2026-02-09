// 블로그 관련 타입
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

// 포트폴리오 관련 타입
export type PortfolioFrontmatter = {
  title: string;
  period: string;
  tech: string[];
  images?: string[];
  summary?: string;
  slug: string;
  githubUrl?: string;
  siteUrl?: string;
  category: "project" | "hackathon";
  categorizedTech?: boolean; // 사용 기술을 카테고리별로 표시할지 여부
  teamMembers?: string; // 팀 구성 (어떤 역할의 팀원들이 있었는지)
  myRole?: string; // 내 역할 담당 범위
};

export type PortfolioCategory = "all" | "project" | "hackathon";

// 공통 타입들
export type Tag = string;
export type Category = string;

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
  activities?: string[]; // Organization에서 사용할 활동 목록
  url?: string; // 링크 URL
};

export type GiscusConfig = {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
};

// 컴포넌트 Props 타입들
export type BlogCardProps = BlogFrontmatter & {
  variants?: import("framer-motion").Variants;
};

export type AdjacentPost = {
  slug: string;
  title: string;
};

export type BlogDetailProps = {
  frontmatter: BlogFrontmatter;
  children: React.ReactNode;
  /** 이전 글(더 오래된 글) */
  prevPost?: AdjacentPost | null;
  /** 다음 글(더 최신 글) */
  nextPost?: AdjacentPost | null;
};

export type PortfolioCardProps = PortfolioFrontmatter & {
  variants?: import("framer-motion").Variants;
};

export type PortfolioDetailProps = {
  frontmatter: PortfolioFrontmatter;
  children: React.ReactNode;
}; 