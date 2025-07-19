import { BlogFrontmatter } from "@/types";
import { GITHUB_CONFIG, BLOG_CATEGORIES, EXCLUDED_LABELS } from "./config";

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

// 상수들
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const USER_ATTACHMENTS_PREFIX = "github.com/user-attachments/assets/";
const VALID_HOSTNAMES = ["githubusercontent.com", "github.com"];

// GitHub Discussions 이미지 URL을 실제 접근 가능한 URL로 변환하는 함수
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
        console.log("Converted GitHub asset URL:", url, "->", data.url);
        return data.url;
      }
    }
  } catch (error) {
    console.error("Error fetching GitHub asset URL:", error);
  }
  
  console.log("Failed to convert URL, using original:", url);
  return url;
};

// 이미지 URL이 유효한지 검증하는 함수
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           VALID_HOSTNAMES.some(hostname => urlObj.hostname.includes(hostname));
  } catch {
    return false;
  }
};

// 썸네일을 본문에서 추출하는 함수
const extractThumbnail = async (body: string): Promise<string> => {
  // GitHub Discussions의 img 태그 형태: <img width="..." height="..." alt="..." src="..." />
  const imgTagMatch = body.match(/<img[^>]+src="([^"]+)"[^>]*>/);
  if (imgTagMatch) {
    const originalUrl = imgTagMatch[1];
    const convertedUrl = await convertGitHubImageUrl(originalUrl);
    if (isValidImageUrl(convertedUrl)) {
      console.log("Extracted thumbnail from img tag:", originalUrl, "->", convertedUrl);
      return convertedUrl;
    }
  }
  
  // 마크다운 이미지 형태: ![...](url)
  const markdownMatch = body.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch) {
    const originalUrl = markdownMatch[1];
    const convertedUrl = await convertGitHubImageUrl(originalUrl);
    if (isValidImageUrl(convertedUrl)) {
      console.log("Extracted thumbnail from markdown:", originalUrl, "->", convertedUrl);
      return convertedUrl;
    }
  }
  
  console.log("No thumbnail found");
  return "";
};

// 본문에서 썸네일로 사용된 첫 번째 이미지를 제거하는 함수
const removeThumbnailFromContent = (body: string, thumbnail: string): string => {
  if (!thumbnail) {
    return body;
  }
  
  // GitHub Discussions의 img 태그 형태 제거
  const imgTagPattern = /<img[^>]+src="([^"]+)"[^>]*>/;
  const imgTagMatch = body.match(imgTagPattern);
  if (imgTagMatch) {
    const originalUrl = imgTagMatch[1];
    if (originalUrl === thumbnail || originalUrl.includes(USER_ATTACHMENTS_PREFIX)) {
      return body.replace(imgTagPattern, '');
    }
  }
  
  // 마크다운 이미지 형태 제거
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

// 카테고리와 태그를 분리하는 함수
const separateCategoryAndTags = (labels: string[]) => {
  const category = labels.find(label => BLOG_CATEGORIES.includes(label)) || "etc";
  const tags = labels.filter(label => 
    !BLOG_CATEGORIES.includes(label) && 
    !EXCLUDED_LABELS.includes(label)
  );
  return { category, tags };
};

const fetchDiscussions = async (): Promise<GitHubDiscussion[]> => {
  if (!GITHUB_CONFIG.token) {
    console.warn("GitHub token not found. Using mock data.");
    return [];
  }

  const query = `
    query {
      repository(owner: "${GITHUB_CONFIG.repoOwner}", name: "${GITHUB_CONFIG.repoName}") {
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
        "Authorization": `Bearer ${GITHUB_CONFIG.token}`,
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

export const getAllBlogPosts = async (): Promise<BlogFrontmatter[]> => {
  const discussions = await fetchDiscussions();
  
  const posts = await Promise.all(
    discussions
      .filter(discussion => {
        const isBlogCategory = discussion.category.name === GITHUB_CONFIG.discussionCategory;
        const isAuthorValid = discussion.author.login === GITHUB_CONFIG.author;
        return isBlogCategory && isAuthorValid;
      })
      .map(async discussion => {
        const labels = discussion.labels.nodes.map(label => label.name);
        const { category, tags } = separateCategoryAndTags(labels);
        const thumbnail = await extractThumbnail(discussion.body);

        return {
          title: discussion.title,
          date: new Date(discussion.createdAt).toISOString().split('T')[0],
          category,
          tags,
          thumbnail,
          summary: discussion.body.substring(0, 150) + "...",
          slug: discussion.id,
          author: discussion.author.login,
          updatedAt: discussion.updatedAt,
        };
      })
  );
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = async (slug: string): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> => {
  const discussions = await fetchDiscussions();
  const discussion = discussions.find(d => d.id === slug);
  
  if (!discussion || discussion.author.login !== GITHUB_CONFIG.author) {
    return null;
  }
  
  const labels = discussion.labels.nodes.map(label => label.name);
  const { category, tags } = separateCategoryAndTags(labels);
  const thumbnail = await extractThumbnail(discussion.body);
  const cleanedContent = removeThumbnailFromContent(discussion.body, thumbnail);

  return {
    frontmatter: {
      title: discussion.title,
      date: new Date(discussion.createdAt).toISOString().split('T')[0],
      category,
      tags,
      thumbnail,
      summary: discussion.body.substring(0, 150) + "...",
      slug: discussion.id,
      author: discussion.author.login,
      updatedAt: discussion.updatedAt,
    },
    content: cleanedContent,
  };
}; 