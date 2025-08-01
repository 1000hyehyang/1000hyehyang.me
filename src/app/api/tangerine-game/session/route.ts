import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

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

// POST: 게임 세션 토큰 생성
export async function POST(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: "Redis 미설정" }, { status: 500 });
    }
    
    const clientIP = await getClientIP();
    const body = await request.json();
    const { sessionId } = body;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: "유효하지 않은 세션 ID입니다." },
        { status: 400 }
      );
    }
    
    // 세션 토큰을 Redis에 저장 (1시간 유효)
    await redis.setex(`session:${sessionId}`, 3600, {
      ip: clientIP,
      createdAt: Date.now(),
      isValid: true
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("게임 세션 생성 실패:", error);
    return NextResponse.json(
      { error: "게임 세션을 생성할 수 없습니다." },
      { status: 500 }
    );
  }
} 