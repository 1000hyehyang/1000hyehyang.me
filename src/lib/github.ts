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
  const tags = labels.filter(label => !BLOG_CATEGORIES.includes(label));
  return { category, tags };
};

const fetchDiscussions = async (): Promise<GitHubDiscussion[]> => {
  const validatedConfig = typeof window === 'undefined' ? getValidatedGitHubConfig() : GITHUB_CONFIG;
  
  if (!validatedConfig.token) {
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
      return [];
    }

    const data: GitHubResponse = await response.json();
    
    if (!data.data?.repository) {
      return [];
    }
    
    return data.data.repository.discussions.nodes;
  } catch {
    return [];
  }
};

const convertDiscussionToPost = (discussion: GitHubDiscussion): BlogFrontmatter => {
  const labels = discussion.labels.nodes.map(label => label.name);
  const { category, tags } = separateCategoryAndTags(labels);

  const cleanBody = discussion.body
    .replace(/<[^>]*>/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: discussion.title,
    date: new Date(discussion.createdAt).toISOString().split('T')[0],
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