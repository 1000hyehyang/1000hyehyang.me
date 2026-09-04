import assert from "node:assert/strict";
import test from "node:test";
import type { PortfolioFrontmatter } from "@/types";
import { splitPortfolioContent } from "./portfolio-content.ts";
import {
  getPortfolioStartTime,
  isPortfolioInFilter,
  parsePortfolioFilter,
  sortPortfolioNewestFirst,
} from "./portfolio.ts";

const project = (
  slug: string,
  period: string,
  overrides: Partial<PortfolioFrontmatter> = {},
): PortfolioFrontmatter => ({
  title: slug,
  slug,
  period,
  tech: [],
  category: "project",
  discipline: "dev",
  ...overrides,
});

test("portfolio filters, dates, sorting, and content sections", () => {
  assert.equal(parsePortfolioFilter("HACKATHON"), "hackathons");
  assert.equal(parsePortfolioFilter("unknown"), "total");
  assert.equal(getPortfolioStartTime("2025.02.29"), 0);
  assert.equal(getPortfolioStartTime("2024.02.29"), Date.UTC(2024, 1, 29));

  const projects = [project("old", "2024.01.01"), project("new", "2025.01.01")];
  assert.deepEqual(sortPortfolioNewestFirst(projects).map(({ slug }) => slug), [
    "new",
    "old",
  ]);
  assert.equal(isPortfolioInFilter(projects[0], "dev"), true);
  assert.equal(
    isPortfolioInFilter(
      project("event", "2025.01.01", { category: "hackathon" }),
      "hackathons",
    ),
    true,
  );

  assert.deepEqual(
    splitPortfolioContent(
      "본문\n<!-- portfolio:info:start -->\n정보\n<!-- portfolio:info:end -->",
    ),
    { core: "본문", info: "정보" },
  );
});
