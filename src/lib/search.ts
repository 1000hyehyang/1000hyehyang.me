import { BlogFrontmatter } from "@/types";

export function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export interface SearchResult {
  post: BlogFrontmatter;
  score: number;
  matchedFields: string[];
}

export const searchBlogPosts = (posts: BlogFrontmatter[], query: string): SearchResult[] => {
  if (!query.trim()) {
    return posts.map((post) => ({ post, score: 0, matchedFields: [] }));
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  posts.forEach((post) => {
    let score = 0;
    const matchedFields: string[] = [];

    const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
    if (titleMatch) {
      score += 10;
      matchedFields.push("title");

      if (post.title.toLowerCase().startsWith(normalizedQuery)) {
        score += 5;
      }
    }

    if (post.summary) {
      const summaryMatch = post.summary.toLowerCase().includes(normalizedQuery);
      if (summaryMatch) {
        score += 5;
        matchedFields.push("summary");
      }
    }

    const tagMatches = post.tags.filter((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );
    if (tagMatches.length > 0) {
      score += tagMatches.length * 3;
      matchedFields.push("tags");
    }

    const categoryMatch = post.category.toLowerCase().includes(normalizedQuery);
    if (categoryMatch) {
      score += 2;
      matchedFields.push("category");
    }

    if (score > 0) {
      results.push({ post, score, matchedFields });
    }
  });

  return results.sort((a, b) => b.score - a.score);
};

export const highlightSearchTerm = (text: string, query: string): string => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, '<mark class="bg-orange-200 px-0.5 rounded">$1</mark>');
};

export const getSearchResultCount = (results: SearchResult[], query: string): string => {
  if (!query.trim()) return "";

  const count = results.length;
  if (count === 0) {
    return `"${query}"에 대한 검색 결과가 없습니다.`;
  } else if (count === 1) {
    return `"${query}"에 대한 검색 결과 1개를 찾았습니다.`;
  } else {
    return `"${query}"에 대한 검색 결과 ${count}개를 찾았습니다.`;
  }
};
