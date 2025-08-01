import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 20);
};

const validateScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 50000;
};

const validatePlayerName = (name: string): boolean => {
  const validPattern = /^[가-힣a-zA-Z0-9\s]{1,20}$/;
  return validPattern.test(name);
};

const getClientIP = async (): Promise<string> => {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  return "localhost";
};

const validateGameSession = async (sessionId: string, ip: string): Promise<boolean> => {
  if (!redis || !sessionId) return false;
  
  try {
    const session = await redis.get(`session:${sessionId}`);
    if (!session) return false;
    
    const sessionData = session as { ip: string; createdAt: number; isValid: boolean };
    const timeDiff = Date.now() - sessionData.createdAt;
    
    // 세션이 유효하고 IP가 일치하며 1시간 이내인지 확인
    return sessionData.isValid && 
           sessionData.ip === ip && 
           timeDiff < 3600000; // 1시간
  } catch (error) {
    console.error("게임 세션 검증 실패:", error);
    return false;
  }
};

// 게임 상태 검증 (실제 게임에서 온 요청인지 확인)
const validateGameState = (gameState: Record<string, unknown>): boolean => {
  // 게임 상태가 유효한지 확인
  if (!gameState || typeof gameState !== 'object') return false;
  
  // 필수 게임 상태 필드 확인
  const requiredFields = ['isPlaying', 'score', 'timeLeft', 'tangerines'];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }
  
  // 게임이 실제로 진행되었는지 확인
  const score = gameState.score as number;
  if (score <= 0 || score > 50000) return false; // 최대 50000점
  
  // 남은 시간이 유효한지 확인
  const timeLeft = gameState.timeLeft as number;
  if (typeof timeLeft !== 'number' || timeLeft < 0 || timeLeft > 60) return false; // 0-60초
  
  // 귤 배열이 유효한지 확인
  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines)) return false;
  
  // 귤 개수가 합리적인 범위인지 확인 (10x20 격자 = 200개)
  if (tangerines.length > 200) return false;
  
  return true;
};



// GET: 리더보드 상위 10개만 반환
export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ leaderboard: [] });
    }
    // Sorted Set에서 상위 10개(score 내림차순)
    const results = await redis.zrange("tangerine_leaderboard", 0, 9, { rev: true, withScores: true });
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      let parsed: Record<string, unknown> = {};
      const member = results[i];
      if (typeof member === "string") {
        try {
          parsed = JSON.parse(member);
        } catch {
          parsed = {};
        }
      } else if (typeof member === "object" && member !== null) {
        parsed = member as Record<string, unknown>;
      }
      leaderboard.push({
        ...parsed,
        score: Number(results[i + 1])
      });
    }
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("천혜향 게임 리더보드 조회 실패:", error);
    return NextResponse.json(
      { error: "리더보드를 조회할 수 없습니다." },
      { status: 500 }
    );
  }
}

// POST: 점수 저장 (리더보드에만)
export async function POST(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: "Redis 미설정" }, { status: 500 });
    }
    
    const clientIP = await getClientIP();
    
    const body = await request.json();
    const { score, playerName, gameSessionId, gameState } = body;
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }
    
    // 게임 세션 검증 (실제 게임에서 온 요청인지 확인)
    if (!gameSessionId || typeof gameSessionId !== 'string') {
      return NextResponse.json(
        { error: "유효하지 않은 게임 세션입니다." },
        { status: 401 }
      );
    }
    
    const isValidSession = await validateGameSession(gameSessionId, clientIP);
    if (!isValidSession) {
      return NextResponse.json(
        { error: "게임 세션이 유효하지 않습니다." },
        { status: 401 }
      );
    }
    
    // 게임 상태 검증 (실제 게임에서 온 요청인지 확인)
    if (!gameState || !validateGameState(gameState)) {
      return NextResponse.json(
        { error: "유효하지 않은 게임 상태입니다." },
        { status: 400 }
      );
    }
    if (!validateScore(score)) {
      return NextResponse.json(
        { error: "유효하지 않은 점수입니다. (0-50000 사이의 정수만 허용)" },
        { status: 400 }
      );
    }
    
    // 점수와 게임 상태의 점수가 일치하는지 확인
    const gameStateScore = gameState.score as number;
    if (Math.abs(score - gameStateScore) > 0) { // 정확히 일치해야 함
      return NextResponse.json(
        { error: "점수가 게임 상태와 일치하지 않습니다." },
        { status: 400 }
      );
    }

    let sanitizedPlayerName = '';
    if (playerName && typeof playerName === 'string') {
      if (!validatePlayerName(playerName)) {
        return NextResponse.json(
          { error: "유효하지 않은 플레이어명입니다. (한글, 영문, 숫자, 공백만 허용)" },
          { status: 400 }
        );
      }
      sanitizedPlayerName = sanitizeInput(playerName);
    }

    // 리더보드에 점수 추가 (동시성 안전)
    await redis.zadd("tangerine_leaderboard", {
      score,
      member: JSON.stringify({
        playerName: sanitizedPlayerName || `Player_${clientIP.slice(-4)}`,
        timestamp: new Date().toISOString()
      })
    });
    // 상위 10개만 반환
    const results = await redis.zrange("tangerine_leaderboard", 0, 9, { rev: true, withScores: true });
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        ...JSON.parse(results[i] as string),
        score: Number(results[i + 1])
      });
    }
    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error("천혜향 게임 점수 저장 실패:", error);
    return NextResponse.json(
      { error: "점수를 저장할 수 없습니다." },
      { status: 500 }
    );
  }
} 