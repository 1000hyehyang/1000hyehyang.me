import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

interface RecentScores {
  [ip: string]: {
    lastSaved: string;
    lastScore: number;
  };
}

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

const getRecentScores = async (): Promise<RecentScores> => {
  if (!redis) return {};
  try {
    const data = await redis.get("tangerine_game_recent_scores");
    if (data) return data as RecentScores;
  } catch (error) {
    console.error("Redis에서 최근 점수 조회 실패:", error);
  }
  return {};
};

const setRecentScores = async (recentScores: RecentScores): Promise<void> => {
  if (!redis) return;
  try {
    await redis.set("tangerine_game_recent_scores", recentScores);
  } catch (error) {
    console.error("Redis에 최근 점수 저장 실패:", error);
  }
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
    const body = await request.json();
    const { score, playerName } = body;
    const clientIP = await getClientIP();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }
    if (!validateScore(score)) {
      return NextResponse.json(
        { error: "유효하지 않은 점수입니다. (0-50000 사이의 정수만 허용)" },
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
    // 중복 저장 방지: 같은 IP에서 30초 내에 같은 점수 저장 시도 시 차단
    const recentScores = await getRecentScores();
    const ipData = recentScores[clientIP];
    const now = new Date().getTime();
    if (ipData) {
      const timeDiff = now - new Date(ipData.lastSaved).getTime();
      const isRecent = timeDiff < 30000;
      const isSameScore = ipData.lastScore === score;
      if (isRecent && isSameScore) {
        return NextResponse.json(
          { error: "같은 점수는 30초 후에 다시 저장할 수 있습니다." },
          { status: 429 }
        );
      }
    }
    // 최근 저장 기록 업데이트
    recentScores[clientIP] = {
      lastSaved: new Date().toISOString(),
      lastScore: score
    };
    await setRecentScores(recentScores);
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