import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 게임 API 경로들
const GAME_API_PATHS = [
  '/api/tangerine-master',
  '/api/tangerine-game',
  '/api/tangerine-master/session',
  '/api/tangerine-game/session'
];

// 허용된 Origin들
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://www.1000hyehyang.me/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 게임 API 경로인지 확인
  const isGameAPI = GAME_API_PATHS.some(path => pathname.startsWith(path));
  
  if (isGameAPI) {
    // 1. Origin 검증 (CORS)
    const origin = request.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: '허용되지 않은 Origin입니다.' },
        { status: 403 }
      );
    }
    
    // 2. Referer 검증 (실제 사이트에서 온 요청인지)
    const referer = request.headers.get('referer');
    if (!referer || !ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
      return NextResponse.json(
        { error: '유효하지 않은 Referer입니다.' },
        { status: 403 }
      );
    }
    
    // 3. User-Agent 검증 (브라우저에서 온 요청인지)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.includes('curl') || userAgent.includes('Postman')) {
      return NextResponse.json(
        { error: '브라우저에서만 접근 가능합니다.' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/tangerine-master/:path*',
    '/api/tangerine-game/:path*',
  ],
}; 