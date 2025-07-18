// GitHub API 설정
export const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN,
  repoOwner: process.env.GITHUB_REPO_OWNER || "1000hyehyang",
  repoName: process.env.GITHUB_REPO_NAME || "1000hyehyang.me",
  author: process.env.GITHUB_AUTHOR || "1000hyehyang",
  discussionCategory: process.env.GITHUB_DISCUSSION_CATEGORY || "blog",
  userId: process.env.NEXT_PUBLIC_GITHUB_USER_ID || "102294782",
} as const;

// 사이트 설정
export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://1000hyehyang.me",
  name: process.env.NEXT_PUBLIC_SITE_NAME || "1000hyehyang.me",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Next.js, TypeScript, 최신 UI/UX 기반의 개발자 블로그 & 포트폴리오",
} as const;

// Giscus 댓글 시스템 설정
export const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "1000hyehyang/1000hyehyang.me",
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
} as const;

// 블로그 카테고리 설정
export const BLOG_CATEGORIES = (process.env.NEXT_PUBLIC_BLOG_CATEGORIES || "Dev,Project,etc").split(",");

// 제외할 라벨들
export const EXCLUDED_LABELS = ["blog", "post"]; 