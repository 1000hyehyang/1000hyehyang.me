import "server-only";

import { NextResponse } from "next/server";
import { getAllPortfolio } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

let routeIndex: ReadonlyMap<string, string> | undefined;

function getRouteIndex(): ReadonlyMap<string, string> {
  if (routeIndex) return routeIndex;

  const nextIndex = new Map<string, string>();

  for (const project of getAllPortfolio()) {
    if (nextIndex.has(project.slug)) {
      throw new Error(`Duplicate portfolio slug: ${project.slug}`);
    }

    nextIndex.set(
      project.slug,
      `/portfolio/${project.category}/${project.slug}`,
    );
  }

  routeIndex = nextIndex;
  return routeIndex;
}

export function getLegacyPortfolioDestination(slug: string): string | null {
  return getRouteIndex().get(slug) ?? null;
}

export function createLegacyPortfolioResponse(slug: string): NextResponse {
  const destination = getLegacyPortfolioDestination(slug);

  if (!destination) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(absoluteUrl(destination), 308);
}
