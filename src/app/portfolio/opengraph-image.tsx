import { SITE_CONFIG } from "@/lib/config";
import { createOgImageResponse } from "@/lib/og/create-og-image";

export const runtime = "edge";
export const alt = "포트폴리오 | Open Graph Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImageResponse({
    siteName: SITE_CONFIG.name,
    badge: "Portfolio",
    title: "포트폴리오",
    description: "프로젝트와 해커톤 여정을 한눈에.",
    footer: `${SITE_CONFIG.name} · Portfolio`,
  });
}
