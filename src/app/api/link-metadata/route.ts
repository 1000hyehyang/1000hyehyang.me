import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface LinkMetadata {
  url: string;
  origin: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

// 상대 URL을 절대 URL로 변환
function absolutize(base: string, maybeRelative?: string | null): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return undefined;
  }
}

// 유효한 값 중 첫 번째 반환
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

async function fetchHTML(url: string): Promise<string> {
  const doFetch = () =>
    fetch(url, {
      headers: BROWSER_LIKE_HEADERS,
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

  let res = await doFetch();
  if (!res.ok) {
    await new Promise((r) => setTimeout(r, 350));
    res = await doFetch();
  }
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return await res.text();
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

// 미리보기 이미지
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

// 파비콘 추출
function extractFavicon($: cheerio.CheerioAPI, origin: string): string | undefined {
  const rels = ["icon", "shortcut icon", "apple-touch-icon"];
  for (const rel of rels) {
    const href = $(`link[rel='${rel}']`).attr("href");
    const abs = absolutize(origin, href);
    if (abs) return abs;
  }
  // 기본 파비콘 또는 구글 파비콘 서비스
  return pick(
    absolutize(origin, "/favicon.ico"),
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`
  );
}

// 메타데이터 추출
const extractMetadata = async (url: string): Promise<LinkMetadata> => {
  try {
    const target = new URL(url);
    const origin = `${target.protocol}//${target.host}`;
    
    const html = await fetchHTML(target.toString());
    const $ = cheerio.load(html);

    // Open Graph 및 Twitter 메타데이터 추출
    const ogTitle = $("meta[property='og:title']").attr("content");
    const ogDesc = $("meta[property='og:description']").attr("content");
    const ogSite = $("meta[property='og:site_name']").attr("content");

    const twTitle = $("meta[name='twitter:title']").attr("content");
    const twDesc = $("meta[name='twitter:description']").attr("content");

    const title = pick(
      ogTitle,
      twTitle,
      $("title").first().text().trim()
    );

    const description = pick(
      ogDesc,
      twDesc,
      $("meta[name='description']").attr("content")
    );

    const siteName = pick(
      ogSite,
      target.hostname.replace(/^www\./, "")
    );

    const favicon = extractFavicon($, origin);
    const image = extractPreviewImage($, target.toString());

    return {
      url: target.toString(),
      origin,
      siteName,
      title,
      description,
      image,
      favicon,
    };
  } catch (error) {
    console.error('링크 메타데이터 추출 실패:', error);
    const target = new URL(url);
    return {
      url: target.toString(),
      origin: `${target.protocol}//${target.host}`,
      siteName: target.hostname.replace(/^www\./, ""),
    };
  }
};

// GET: 링크 메타데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다.' },
        { status: 400 }
      );
    }

    // HTTP/HTTPS 프로토콜만 허용
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'HTTP 또는 HTTPS URL만 허용됩니다.' },
        { status: 400 }
      );
    }

    const metadata = await extractMetadata(url);
    
    return NextResponse.json(metadata, { 
      status: 200, 
      headers: { "Cache-Control": "public, max-age=600" }
    });
  } catch (error) {
    console.error('링크 메타데이터 API 오류:', error);
    return NextResponse.json(
      { error: '메타데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
