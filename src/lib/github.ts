import { BlogFrontmatter } from "@/types";
import { GITHUB_CONFIG, BLOG_CATEGORIES, getValidatedGitHubConfig } from "./config";

interface GitHubDiscussion {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  category: {
    name: string;
  };
  labels: {
    nodes: Array<{
      name: string;
    }>;
  };
}

interface GitHubResponse {
  data: {
    repository: {
      discussions: {
        nodes: GitHubDiscussion[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    };
  };
}

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const USER_ATTACHMENTS_PREFIX = "github.com/user-attachments/assets/";
const VALID_HOSTNAMES = ["githubusercontent.com", "github.com"];

const convertGitHubImageUrl = async (url: string): Promise<string> => {
  if (!url.includes(USER_ATTACHMENTS_PREFIX)) {
    return url;
  }

  const assetId = url.split('/').pop();
  if (!assetId) {
    return url;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user/assets/${assetId}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (error) {
    console.error("Error fetching GitHub asset URL:", error);
  }
  
  return url;
};

const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           VALID_HOSTNAMES.some(hostname => urlObj.hostname.includes(hostname));
  } catch {
    return false;
  }
};

const extractThumbnail = async (body: string): Promise<string> => {
  const imgTagMatch = body.match(/<img[^>]+src="([^"]+)"[^>]*>/);
  if (imgTagMatch) {
    const originalUrl = imgTagMatch[1];
    const convertedUrl = await convertGitHubImageUrl(originalUrl);
    if (isValidImageUrl(convertedUrl)) {
      return convertedUrl;
    }
  }
  
  const markdownMatch = body.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch) {
    const originalUrl = markdownMatch[1];
    const convertedUrl = await convertGitHubImageUrl(originalUrl);
    if (isValidImageUrl(convertedUrl)) {
      return convertedUrl;
    }
  }
  
  return "";
};

const removeThumbnailFromContent = (body: string, thumbnail: string): string => {
  if (!thumbnail) {
    return body;
  }
  
  const imgTagPattern = /<img[^>]+src="([^"]+)"[^>]*>/;
  const imgTagMatch = body.match(imgTagPattern);
  if (imgTagMatch) {
    const originalUrl = imgTagMatch[1];
    if (originalUrl === thumbnail || originalUrl.includes(USER_ATTACHMENTS_PREFIX)) {
      return body.replace(imgTagPattern, '');
    }
  }
  
  const markdownPattern = /!\[.*?\]\((.*?)\)/;
  const markdownMatch = body.match(markdownPattern);
  if (markdownMatch) {
    const originalUrl = markdownMatch[1];
    if (originalUrl === thumbnail || originalUrl.includes(USER_ATTACHMENTS_PREFIX)) {
      return body.replace(markdownPattern, '');
    }
  }
  
  return body;
};

const separateCategoryAndTags = (labels: string[]) => {
  const category = labels.find(label => BLOG_CATEGORIES.includes(label)) || "etc";
  const tags = labels.filter(label => !BLOG_CATEGORIES.includes(label));
  return { category, tags };
};

const fetchDiscussions = async (): Promise<GitHubDiscussion[]> => {
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  
  if (!validatedConfig.token) {
    console.warn("GitHub token not found. Using mock data.");
    return [];
  }

  const query = `
    query {
      repository(owner: "${validatedConfig.repoOwner}", name: "${validatedConfig.repoName}") {
        discussions(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            id
            title
            body
            createdAt
            updatedAt
            author {
              login
              avatarUrl
            }
            category {
              name
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${validatedConfig.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubResponse = await response.json();
    
    if (!data.data?.repository) {
      console.error("Repository not found. Check if the repository exists and Discussions is enabled.");
      return [];
    }
    
    return data.data.repository.discussions.nodes;
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return [];
  }
};

const convertDiscussionToPost = async (discussion: GitHubDiscussion): Promise<BlogFrontmatter> => {
  const labels = discussion.labels.nodes.map(label => label.name);
  const { category, tags } = separateCategoryAndTags(labels);
  const thumbnail = await extractThumbnail(discussion.body);

  // HTML 태그 제거 및 순수 텍스트 추출
  const cleanBody = discussion.body
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/!\[.*?\]\(.*?\)/g, '') // 마크다운 이미지 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();

  return {
    title: discussion.title,
    date: new Date(discussion.createdAt).toISOString().split('T')[0],
    category,
    tags,
    thumbnail,
    summary: cleanBody.substring(0, 150) + (cleanBody.length > 150 ? "..." : ""),
    slug: discussion.id,
    author: discussion.author.login,
    updatedAt: discussion.updatedAt,
  };
};

export const getAllBlogPosts = async (): Promise<BlogFrontmatter[]> => {
  const discussions = await fetchDiscussions();
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  
  const posts = await Promise.all(
    discussions
      .filter(discussion => {
        const isBlogCategory = discussion.category.name === validatedConfig.discussionCategory;
        const isAuthorValid = discussion.author.login === validatedConfig.author;
        return isBlogCategory && isAuthorValid;
      })
      .map(convertDiscussionToPost)
  );
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = async (slug: string): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> => {
  const discussions = await fetchDiscussions();
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  const discussion = discussions.find(d => d.id === slug);
  
  if (!discussion || discussion.author.login !== validatedConfig.author) {
    return null;
  }
  
  const frontmatter = await convertDiscussionToPost(discussion);
  const cleanedContent = removeThumbnailFromContent(discussion.body, frontmatter.thumbnail || "");

  return {
    frontmatter,
    content: cleanedContent,
  };
}; 