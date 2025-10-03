import { NextResponse } from "next/server";
import { getRedisClient, getClientIP } from "@/lib/api-utils";

const redis = getRedisClient();

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
    
    // 세션 토큰을 Redis에 저장 (10분 유효)
    await redis.setex(`session:${sessionId}`, 600, {
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