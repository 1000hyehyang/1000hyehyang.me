import "server-only";

import { NextResponse } from "next/server";
import { getAllPortfolio } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

let routeIndex: ReadonlyMap<string, string> | undefined;

function getRouteIndex(): ReadonlyMap<string, string> {
  if (routeIndex) return routeIndex;

  routeIndex = new Map(
    getAllPortfolio().map(({ slug, category }) => [
      slug,
      `/portfolio/${category}/${slug}`,
    ]),
  );
  return routeIndex;
}

export function createLegacyPortfolioResponse(slug: string): NextResponse {
  const destination = getRouteIndex().get(slug);

  if (!destination) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(absoluteUrl(destination), 308);
}
