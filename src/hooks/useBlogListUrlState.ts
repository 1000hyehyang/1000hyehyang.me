"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PARAM_KEYS = {
  category: "category",
  page: "page",
  q: "q",
} as const;

const DEFAULTS = {
  category: "ALL",
  page: 1,
  q: "",
} as const;

interface BlogListUrlUpdates {
  category?: string;
  page?: number;
  q?: string;
}

function parsePage(value: string | null): number {
  if (value === null) return DEFAULTS.page;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 ? n : DEFAULTS.page;
}

export interface BlogListUrlState {
  category: string;
  page: number;
  searchQuery: string;
  setCategory: (category: string) => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
}

export function useBlogListUrlState(): BlogListUrlState {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategoryState] = useState(() =>
    searchParams.get(PARAM_KEYS.category) ?? DEFAULTS.category
  );
  const [page, setPageState] = useState(() =>
    parsePage(searchParams.get(PARAM_KEYS.page))
  );
  const [searchQuery, setSearchQueryState] = useState(() =>
    searchParams.get(PARAM_KEYS.q) ?? DEFAULTS.q
  );

  const replaceUrl = useCallback(
    (updates: BlogListUrlUpdates) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === DEFAULTS.category) params.delete(PARAM_KEYS.category);
        else params.set(PARAM_KEYS.category, updates.category);
      }
      if (updates.page !== undefined) {
        if (updates.page <= 1) params.delete(PARAM_KEYS.page);
        else params.set(PARAM_KEYS.page, String(updates.page));
      }
      if (updates.q !== undefined) {
        if (updates.q === "") params.delete(PARAM_KEYS.q);
        else params.set(PARAM_KEYS.q, String(updates.q));
      }

      const query = params.toString();
      router.replace(query ? `/blog?${query}` : "/blog", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    setCategoryState(searchParams.get(PARAM_KEYS.category) ?? DEFAULTS.category);
    setPageState(parsePage(searchParams.get(PARAM_KEYS.page)));
    setSearchQueryState(searchParams.get(PARAM_KEYS.q) ?? DEFAULTS.q);
  }, [searchParams]);

  const setCategory = useCallback(
    (next: string) => {
      setCategoryState(next);
      setPageState(DEFAULTS.page);
      replaceUrl({ category: next, page: DEFAULTS.page });
    },
    [replaceUrl]
  );

  const setPage = useCallback(
    (next: number) => {
      setPageState(next);
      replaceUrl({ page: next });
    },
    [replaceUrl]
  );

  const setSearchQuery = useCallback(
    (next: string) => {
      setSearchQueryState(next);
      replaceUrl({ q: next, page: DEFAULTS.page });
    },
    [replaceUrl]
  );

  return {
    category,
    page,
    searchQuery,
    setCategory,
    setPage,
    setSearchQuery,
  };
}
