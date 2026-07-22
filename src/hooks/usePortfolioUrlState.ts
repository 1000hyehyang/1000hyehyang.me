"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortfolioFilter } from "@/types";
import { parsePortfolioFilter } from "@/lib/portfolio";

const FILTER_PARAM = "filter";
const LEGACY_CATEGORY_PARAM = "category";

function readFilterFromLocation(): PortfolioFilter {
  const params = new URLSearchParams(window.location.search);
  return parsePortfolioFilter(
    params.get(FILTER_PARAM) ?? params.get(LEGACY_CATEGORY_PARAM),
  );
}

export interface PortfolioUrlState {
  filter: PortfolioFilter;
  setFilter: (filter: PortfolioFilter) => void;
}

export function usePortfolioUrlState(
  initialFilter: PortfolioFilter,
): PortfolioUrlState {
  const [filter, setFilterState] = useState<PortfolioFilter>(initialFilter);

  useEffect(() => {
    const syncFromUrl = () => setFilterState(readFilterFromLocation());
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const setFilter = useCallback((nextFilter: PortfolioFilter) => {
    setFilterState(nextFilter);

    const url = new URL(window.location.href);
    url.searchParams.delete(LEGACY_CATEGORY_PARAM);

    if (nextFilter === "total") {
      url.searchParams.delete(FILTER_PARAM);
    } else {
      url.searchParams.set(FILTER_PARAM, nextFilter);
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  return { filter, setFilter };
}
