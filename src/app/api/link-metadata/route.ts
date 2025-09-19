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

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10000), // 10초 타임아웃
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return await res.text();
}

function extractFavicon($: cheerio.CheerioAPI, origin: string): string | undefined {
  // 우선순위: <link rel="icon"> / <link rel="shortcut icon"> / <link rel="apple-touch-icon">
  const rels = ["icon", "shortcut icon", "apple-touch-icon"];
  for (const rel of rels) {
    const href = $(`link[rel='${rel}']`).attr("href");
    const abs = absolutize(origin, href);
    if (abs) return abs;
  }
  // 기본값: /favicon.ico 또는 구글 파비콘 서비스 (fallback)
  return pick(
    absolutize(origin, "/favicon.ico"),
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`
  );
}

const extractMetadata = async (url: string): Promise<LinkMetadata> => {
  try {
    const target = new URL(url);
    const origin = `${target.protocol}//${target.host}`;
    
    const html = await fetchHTML(target.toString());
    const $ = cheerio.load(html);

    // Open Graph 우선, 그 다음 일반 meta/title
    const ogTitle = $("meta[property='og:title']").attr("content");
    const ogDesc = $("meta[property='og:description']").attr("content");
    const ogSite = $("meta[property='og:site_name']").attr("content");
    const ogImage = $("meta[property='og:image']").attr("content");

    const twTitle = $("meta[name='twitter:title']").attr("content");
    const twDesc = $("meta[name='twitter:description']").attr("content");
    const twImage = $("meta[name='twitter:image'], meta[name='twitter:image:src']").attr("content");

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

    // 이미지는 가져오지 않음
    const image = undefined;

    const siteName = pick(
      ogSite,
      target.hostname.replace(/^www\./, "")
    );

    const favicon = extractFavicon($, origin);

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

    // 허용된 프로토콜만 허용
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
