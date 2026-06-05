import { SITE_CONFIG } from "@/lib/config";
import { createOgImageResponse } from "@/lib/og/create-og-image";

export const runtime = "edge";
export const alt = `${SITE_CONFIG.name} Open Graph Image`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImageResponse({
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    footer: new URL(SITE_CONFIG.url).hostname,
  });
}
