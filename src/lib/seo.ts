import { SITE_CONFIG } from "@/lib/config";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_CONFIG.url).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
