import type { NextRequest } from "next/server";
import { createLegacyPortfolioResponse } from "@/lib/legacy-portfolio-routes";

type LegacyPortfolioRouteContext = {
  params: Promise<{ category: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: LegacyPortfolioRouteContext,
) {
  const { category: legacySlug } = await params;
  return createLegacyPortfolioResponse(legacySlug);
}
