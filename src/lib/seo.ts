import { SITE_CONFIG } from "@/lib/config";

export const DEFAULT_OG_IMAGE = {
  url: "/og-1000hyehyang.png",
  width: 1200,
  height: 630,
  alt: "1000HYEHYANG PORTFOLIO",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_CONFIG.url).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
