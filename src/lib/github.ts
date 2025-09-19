import { BlogFrontmatter } from "@/types";
import { GITHUB_CONFIG, getValidatedGitHubConfig } from "./config";
import { BLOG_CATEGORIES } from "./data";

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

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const separateCategoryAndTags = (labels: string[]) => {
  const category = labels.find(label => BLOG_CATEGORIES.includes(label)) || "etc";
  // 라벨은 고정글과 카테고리 구분 용도로만 사용하므로 태그는 빈 배열로 설정
  const tags: string[] = [];
  return { category, tags };
};

// 고정 글 설정
export const PINNED_POSTS_CONFIG = {
  // 고정 글을 식별하는 라벨
  pinnedLabel: "pinned",
  // 고정 글 섹션 제목
  sectionTitle: "Pinned Posts",
} as const;

const fetchDiscussions = async (): Promise<GitHubDiscussion[]> => {
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  
  if (!validatedConfig.token) {
    console.warn('GitHub 토큰이 설정되지 않았습니다.');
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
      // ISR: 1시간마다 재검증, Webhook으로 즉시 갱신
      next: { revalidate: 3600, tags: ['github-discussions'] }
    });

    if (!response.ok) {
      console.warn('GitHub API 응답 실패:', response.status, response.statusText);
      return [];
    }

    const data: GitHubResponse = await response.json();
    
    if (!data.data?.repository) {
      console.warn('GitHub 저장소를 찾을 수 없습니다.');
      return [];
    }
    
    return data.data.repository.discussions.nodes;
  } catch (error) {
    console.warn('GitHub API 요청 실패:', error);
    return [];
  }
};

const convertDiscussionToPost = (discussion: GitHubDiscussion): BlogFrontmatter => {
  const labels = discussion.labels.nodes.map(label => label.name);
  const { category, tags } = separateCategoryAndTags(labels);

  // 마크다운 및 HTML 태그 제거 및 텍스트 정리
  const cleanBody = discussion.body
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // 마크다운 이미지 제거
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 마크다운 링크 제거 (링크 텍스트만 남김)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 마크다운 강조 제거
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 마크다운 코드 블록 제거
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // 마크다운 헤더 제거
    .replace(/^#{1,6}\s+/gm, '')
    // 마크다운 리스트 제거
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 마크다운 인용구 제거
    .replace(/^>\s+/gm, '')
    // 마크다운 구분선 제거
    .replace(/^[-*_]{3,}$/gm, '')
    // 연속된 공백을 하나로
    .replace(/\s+/g, ' ')
    .trim();

  // 안전한 날짜 변환
  const date = new Date(discussion.createdAt);
  const formattedDate = isNaN(date.getTime()) 
    ? new Date().toISOString().split('T')[0] 
    : date.toISOString().split('T')[0];

  return {
    title: discussion.title || '제목 없음',
    date: formattedDate,
    category,
    tags,
    summary: cleanBody.substring(0, 150) + (cleanBody.length > 150 ? "..." : ""),
    slug: discussion.id,
    author: discussion.author.login,
    updatedAt: discussion.updatedAt,
  };
};

export const getAllBlogPosts = async (): Promise<BlogFrontmatter[]> => {
  const discussions = await fetchDiscussions();
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  
  const posts = discussions
    .filter(discussion => {
      const isBlogCategory = discussion.category.name === validatedConfig.discussionCategory;
      const isAuthorValid = discussion.author.login === validatedConfig.author;
      return isBlogCategory && isAuthorValid;
    })
    .map(convertDiscussionToPost);
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = async (slug: string): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> => {
  const discussions = await fetchDiscussions();
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  const discussion = discussions.find(d => d.id === slug);
  
  if (!discussion || discussion.author.login !== validatedConfig.author) {
    return null;
  }
  
  const frontmatter = convertDiscussionToPost(discussion);

  return {
    frontmatter,
    content: discussion.body,
  };
};

// 고정 글 목록 가져오기
export const getPinnedPosts = async (): Promise<BlogFrontmatter[]> => {
  try {
    const discussions = await fetchDiscussions();
    const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
    
    const pinnedDiscussions = discussions.filter(discussion => {
      const isBlogCategory = discussion.category.name === validatedConfig.discussionCategory;
      const isAuthorValid = discussion.author.login === validatedConfig.author;
      const isPinned = discussion.labels.nodes.some(label => label.name === PINNED_POSTS_CONFIG.pinnedLabel);
      return isBlogCategory && isAuthorValid && isPinned;
    });
    
    return pinnedDiscussions.map(convertDiscussionToPost);
  } catch (error) {
    console.error('고정 글 목록 조회 실패:', error);
    return [];
  }
};

// 특정 고정 글 가져오기
export const getPinnedPostBySlug = async (slug: string): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> => {
  try {
    const discussions = await fetchDiscussions();
    const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
    const discussion = discussions.find(d => {
      const isPinned = d.labels.nodes.some(label => label.name === PINNED_POSTS_CONFIG.pinnedLabel);
      return d.id === slug && isPinned && d.author.login === validatedConfig.author;
    });
    
    if (!discussion) {
      return null;
    }

    return {
      frontmatter: convertDiscussionToPost(discussion),
      content: discussion.body,
    };
  } catch (error) {
    console.error('고정 글 조회 실패:', error);
    return null;
  }
}; 