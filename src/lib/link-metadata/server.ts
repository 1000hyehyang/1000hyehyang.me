import * as cheerio from "cheerio";
import type { LinkMetadata } from "./types";

function absolutize(base: string, maybeRelative?: string | null): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return undefined;
  }
}

function pick<T>(...vals: (T | undefined)[]): T | undefined {
  return vals.find(Boolean) as T | undefined;
}

const BROWSER_LIKE_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
};

const FACEBOOK_OG_CRAWLER_HEADERS: HeadersInit = {
  "User-Agent":
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const DISCORD_BOT_HEADERS: HeadersInit = {
  "User-Agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function looksLikeBotWallOrChallenge(html: string): boolean {
  const head = html.slice(0, 16000).toLowerCase();
  return (
    head.includes("cf-browser-verification") ||
    head.includes('id="cf-challenge-running"') ||
    head.includes("checking your browser") ||
    head.includes("just a moment") ||
    head.includes("enable javascript and cookies") ||
    head.includes("attention required! | cloudflare")
  );
}

async function fetchHTML(url: string): Promise<string> {
  const strategies: HeadersInit[] = [
    BROWSER_LIKE_HEADERS,
    FACEBOOK_OG_CRAWLER_HEADERS,
    DISCORD_BOT_HEADERS,
  ];

  let lastError: unknown;
  for (const headers of strategies) {
    try {
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        lastError = new Error(`Upstream ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (looksLikeBotWallOrChallenge(text)) {
        lastError = new Error("Challenge or bot wall HTML");
        continue;
      }
      return text;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("HTML fetch failed");
}

function absolutizeOgImage(pageUrl: string, trimmed: string): string | undefined {
  if (trimmed.startsWith("//")) {
    try {
      return `${new URL(pageUrl).protocol}${trimmed}`;
    } catch {
      return undefined;
    }
  }
  const abs = absolutize(pageUrl, trimmed);
  if (abs?.startsWith("http://") || abs?.startsWith("https://")) return abs;
  return undefined;
}

function extractPreviewImage($: cheerio.CheerioAPI, pageUrl: string): string | undefined {
  const rawCandidates = [
    $("meta[property='og:image']").attr("content"),
    $("meta[property='og:image:url']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
    $("meta[name='twitter:image:src']").attr("content"),
    $("link[rel='image_src']").attr("href"),
  ];
  for (const raw of rawCandidates) {
    const trimmed = raw?.trim();
    if (!trimmed || trimmed.startsWith("data:")) continue;
    const abs = absolutizeOgImage(pageUrl, trimmed);
    if (abs) return abs;
  }
  return undefined;
}

function extractFavicon($: cheerio.CheerioAPI, origin: string): string | undefined {
  const rels = ["icon", "shortcut icon", "apple-touch-icon"];
  for (const rel of rels) {
    const href = $(`link[rel='${rel}']`).attr("href");
    const abs = absolutize(origin, href);
    if (abs) return abs;
  }
  return pick(
    absolutize(origin, "/favicon.ico"),
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`
  );
}

function fallbackMetadata(url: string): LinkMetadata {
  const target = new URL(url);
  return {
    url: target.toString(),
    origin: `${target.protocol}//${target.host}`,
    siteName: target.hostname.replace(/^www\./, ""),
  };
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  try {
    const target = new URL(url);
    const origin = `${target.protocol}//${target.host}`;

    const html = await fetchHTML(target.toString());
    const $ = cheerio.load(html);

    const ogTitle = $("meta[property='og:title']").attr("content");
    const ogDesc = $("meta[property='og:description']").attr("content");
    const ogSite = $("meta[property='og:site_name']").attr("content");
    const twTitle = $("meta[name='twitter:title']").attr("content");
    const twDesc = $("meta[name='twitter:description']").attr("content");

    const title = pick(ogTitle, twTitle, $("title").first().text().trim());
    const description = pick(ogDesc, twDesc, $("meta[name='description']").attr("content"));
    const siteName = pick(ogSite, target.hostname.replace(/^www\./, ""));

    return {
      url: target.toString(),
      origin,
      siteName,
      title,
      description,
      image: extractPreviewImage($, target.toString()),
      favicon: extractFavicon($, origin),
    };
  } catch (error) {
    console.error("fetchLinkMetadata:", error);
    return fallbackMetadata(url);
  }
}
