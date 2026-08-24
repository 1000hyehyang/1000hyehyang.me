import type { NextRequest } from "next/server";
import { createLegacyPortfolioResponse } from "@/lib/legacy-portfolio-routes";

type LegacyPortfolioProjectsRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: LegacyPortfolioProjectsRouteContext,
) {
  const { slug } = await params;
  return createLegacyPortfolioResponse(slug);
}
