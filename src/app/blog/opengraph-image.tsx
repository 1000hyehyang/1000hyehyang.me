import { SITE_CONFIG } from "@/lib/config";
import { createOgImageResponse } from "@/lib/og/create-og-image";

export const runtime = "edge";
export const alt = "블로그 | Open Graph Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImageResponse({
    siteName: SITE_CONFIG.name,
    badge: "Blog",
    title: "블로그",
    description: "글로 정리하며 성장하는 개발자 천혜향의 기록.",
    footer: `${SITE_CONFIG.name} · Blog`,
  });
}
