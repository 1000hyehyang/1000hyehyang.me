import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GAME_API_PATHS = [
  "/api/tangerine-master",
  "/api/tangerine-game",
  "/api/tangerine-master/session",
  "/api/tangerine-game/session",
];

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://www.1000hyehyang.me",
  "https://1000hyehyang.me",
] as const;

const ALLOWED_HOSTS = new Set(["www.1000hyehyang.me", "1000hyehyang.me"]);

const isAllowedHost = (host: string | null): boolean => {
  if (!host) return false;
  return host.startsWith("localhost") || ALLOWED_HOSTS.has(host);
};

const isAllowedReferer = (referer: string | null): boolean =>
  !!referer && ALLOWED_ORIGINS.some((origin) => referer.startsWith(origin));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGameAPI = GAME_API_PATHS.some((path) => pathname.startsWith(path));

  if (isGameAPI) {
    const origin = request.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin as (typeof ALLOWED_ORIGINS)[number])) {
      return NextResponse.json(
        { error: "허용되지 않은 Origin입니다." },
        { status: 403 }
      );
    }

    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    if (!isAllowedReferer(referer) && !isAllowedHost(host)) {
      return NextResponse.json(
        { error: "유효하지 않은 Referer입니다." },
        { status: 403 }
      );
    }

    const userAgent = request.headers.get("user-agent");
    if (!userAgent || userAgent.includes("curl") || userAgent.includes("Postman")) {
      return NextResponse.json(
        { error: "브라우저에서만 접근 가능합니다." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/tangerine-master/:path*",
    "/api/tangerine-game/:path*",
  ],
};
