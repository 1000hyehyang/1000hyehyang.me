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

// 썸네일을 본문에서 추출하는 함수
const extractThumbnail = (body: string, fallback: string): string => {
  // GitHub Discussions의 img 태그 형태: <img width="..." height="..." alt="..." src="..." />
  const imgTagMatch = body.match(/<img[^>]+src="([^"]+)"[^>]*>/);
  if (imgTagMatch) {
    return imgTagMatch[1];
  }
  
  // 마크다운 이미지 형태: ![...](url)
  const markdownMatch = body.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch) {
    return markdownMatch[1];
  }
  
  return fallback;
};

// 본문에서 썸네일로 사용된 첫 번째 이미지를 제거하는 함수
const removeThumbnailFromContent = (body: string, thumbnail: string): string => {
  // 썸네일이 작성자 아바타인 경우 제거하지 않음
  if (thumbnail.includes('avatars.githubusercontent.com')) {
    return body;
  }
  
  // GitHub Discussions의 img 태그 형태 제거
  const imgTagPattern = /<img[^>]+src="([^"]+)"[^>]*>/;
  const imgTagMatch = body.match(imgTagPattern);
  if (imgTagMatch && imgTagMatch[1] === thumbnail) {
    return body.replace(imgTagPattern, '');
  }
  
  // 마크다운 이미지 형태 제거
  const markdownPattern = /!\[.*?\]\((.*?)\)/;
  const markdownMatch = body.match(markdownPattern);
  if (markdownMatch && markdownMatch[1] === thumbnail) {
    return body.replace(markdownPattern, '');
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
    const response = await fetch("https://api.github.com/graphql", {
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
    
    // 디버깅을 위한 로그 추가
    console.log("GitHub API Response:", JSON.stringify(data, null, 2));
    
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
  
  return discussions
    .filter(discussion => {
      // 블로그 포스트로 사용할 카테고리 필터링
      const isBlogCategory = discussion.category.name === GITHUB_CONFIG.discussionCategory;
      // 작성자가 설정된 사용자인지 확인
      const isAuthorValid = discussion.author.login === GITHUB_CONFIG.author;
      
      return isBlogCategory && isAuthorValid;
    })
    .map(discussion => {
      const labels = discussion.labels.nodes.map(label => label.name);
      
      // 카테고리와 태그 분리
      const { category, tags } = separateCategoryAndTags(labels);
      
      // 썸네일을 본문에서 추출
      const thumbnail = extractThumbnail(discussion.body, discussion.author.avatarUrl);

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = async (slug: string): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> => {
  const discussions = await fetchDiscussions();
  const discussion = discussions.find(d => d.id === slug);
  
  if (!discussion) return null;
  
  // 작성자가 설정된 사용자인지 확인
  if (discussion.author.login !== GITHUB_CONFIG.author) {
    return null;
  }
  
  const labels = discussion.labels.nodes.map(label => label.name);
  
  // 카테고리와 태그 분리
  const { category, tags } = separateCategoryAndTags(labels);
  
  // 썸네일을 본문에서 추출
  const thumbnail = extractThumbnail(discussion.body, discussion.author.avatarUrl);
  
  // 본문에서 썸네일 이미지 제거
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