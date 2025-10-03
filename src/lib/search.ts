import { BlogFrontmatter } from "@/types";

// 디바운스 함수
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

// 블로그 포스트 검색
export const searchBlogPosts = (posts: BlogFrontmatter[], query: string): SearchResult[] => {
  if (!query.trim()) {
    return posts.map(post => ({ post, score: 0, matchedFields: [] }));
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  posts.forEach(post => {
    let score = 0;
    const matchedFields: string[] = [];

    // 제목 검색 (가중치 10)
    const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
    if (titleMatch) {
      score += 10;
      matchedFields.push('title');
      
      // 제목 시작 부분 매치 시 추가 점수
      if (post.title.toLowerCase().startsWith(normalizedQuery)) {
        score += 5;
      }
    }

    // 요약 검색 (가중치 5)
    if (post.summary) {
      const summaryMatch = post.summary.toLowerCase().includes(normalizedQuery);
      if (summaryMatch) {
        score += 5;
        matchedFields.push('summary');
      }
    }

    // 태그 검색 (가중치 3)
    const tagMatches = post.tags.filter(tag => 
      tag.toLowerCase().includes(normalizedQuery)
    );
    if (tagMatches.length > 0) {
      score += tagMatches.length * 3;
      matchedFields.push('tags');
    }

    // 카테고리 검색
    const categoryMatch = post.category.toLowerCase().includes(normalizedQuery);
    if (categoryMatch) {
      score += 2;
      matchedFields.push('category');
    }

    // 점수가 0보다 크면 결과에 포함
    if (score > 0) {
      results.push({ post, score, matchedFields });
    }
  });

  // 점수 순으로 정렬 (높은 점수부터)
  return results.sort((a, b) => b.score - a.score);
};

/**
 * 검색어를 하이라이트하는 함수
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이트된 HTML 문자열
 */
export const highlightSearchTerm = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-orange-200 px-0.5 rounded">$1</mark>');
};

/**
 * 검색 결과 개수를 반환하는 함수
 * @param results 검색 결과 배열
 * @param query 검색어
 * @returns 결과 개수 문자열
 */
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
