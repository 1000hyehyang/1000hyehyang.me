const validateRequiredEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN,
  repoOwner: process.env.GITHUB_REPO_OWNER || "",
  repoName: process.env.GITHUB_REPO_NAME || "",
  author: process.env.GITHUB_AUTHOR || "",
  discussionCategory: process.env.GITHUB_DISCUSSION_CATEGORY || "",
  userId: process.env.NEXT_PUBLIC_GITHUB_USER_ID || "",
} as const;

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  name: process.env.NEXT_PUBLIC_SITE_NAME || "",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "",
} as const;

export const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "",
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
} as const;

export const getValidatedGitHubConfig = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getValidatedGitHubConfig should only be called on server side');
  }
  
  return {
    token: validateRequiredEnv("GITHUB_TOKEN", process.env.GITHUB_TOKEN),
    repoOwner: validateRequiredEnv("GITHUB_REPO_OWNER", process.env.GITHUB_REPO_OWNER),
    repoName: validateRequiredEnv("GITHUB_REPO_NAME", process.env.GITHUB_REPO_NAME),
    author: validateRequiredEnv("GITHUB_AUTHOR", process.env.GITHUB_AUTHOR),
    discussionCategory: validateRequiredEnv("GITHUB_DISCUSSION_CATEGORY", process.env.GITHUB_DISCUSSION_CATEGORY),
    userId: validateRequiredEnv("NEXT_PUBLIC_GITHUB_USER_ID", process.env.NEXT_PUBLIC_GITHUB_USER_ID),
  } as const;
}; 