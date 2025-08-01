import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 키보드 이벤트 핸들러
export const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

// 안전한 localStorage 유틸리티 함수들
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`localStorage 접근 실패 (${key}):`, error);
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`localStorage 저장 실패 (${key}):`, error);
    }
  },

  getNumber: (key: string, defaultValue: number = 0): number => {
    const saved = safeLocalStorage.getItem(key);
    if (saved) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  },

  setNumber: (key: string, value: number): void => {
    safeLocalStorage.setItem(key, value.toString());
  },

  getBoolean: (key: string, defaultValue: boolean = false): boolean => {
    const saved = safeLocalStorage.getItem(key);
    if (saved !== null) {
      return saved === 'true';
    }
    return defaultValue;
  },

  setBoolean: (key: string, value: boolean): void => {
    safeLocalStorage.setItem(key, value.toString());
  }
};

// 공통 에러 로깅 유틸리티
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(message, error);
  },
  
  warn: (message: string, error?: unknown) => {
    console.warn(message, error);
  },
  
  info: (message: string, data?: unknown) => {
    console.info(message, data);
  }
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 텍스트 자르기
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// 카테고리 필터링
export const filterByCategory = <T extends { category: string }>(
  items: T[],
  selectedCategory: string
): T[] => {
  if (selectedCategory === "ALL") {
    return items;
  }
  return items.filter(item => item.category === selectedCategory);
};
