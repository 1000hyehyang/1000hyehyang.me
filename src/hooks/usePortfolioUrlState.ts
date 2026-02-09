"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PortfolioCategory } from "@/types";

const PARAM_CATEGORY = "category" as const;
const VALID_CATEGORIES: PortfolioCategory[] = ["all", "project", "hackathon"];

function parseCategory(value: string | null): PortfolioCategory {
  if (value === null) return "all";
  const lower = value.toLowerCase();
  return VALID_CATEGORIES.includes(lower as PortfolioCategory) ? (lower as PortfolioCategory) : "all";
}

export interface PortfolioUrlState {
  category: PortfolioCategory;
  setCategory: (category: PortfolioCategory) => void;
}

/**
 * 포트폴리오 목록의 카테고리 상태를 URL과 동기화합니다.
 * 뒤로가기/앞으로가기 시 이전 선택 탭이 복원됩니다.
 */
export function usePortfolioUrlState(): PortfolioUrlState {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategoryState] = useState<PortfolioCategory>(() =>
    parseCategory(searchParams.get(PARAM_CATEGORY))
  );

  const replaceUrl = useCallback(
    (next: PortfolioCategory) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "all") {
        params.delete(PARAM_CATEGORY);
      } else {
        params.set(PARAM_CATEGORY, next);
      }
      const query = params.toString();
      router.replace(query ? `/portfolio?${query}` : "/portfolio", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    setCategoryState(parseCategory(searchParams.get(PARAM_CATEGORY)));
  }, [searchParams]);

  const setCategory = useCallback(
    (next: PortfolioCategory) => {
      setCategoryState(next);
      replaceUrl(next);
    },
    [replaceUrl]
  );

  return { category, setCategory };
}
