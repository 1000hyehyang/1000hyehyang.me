import { NextResponse } from "next/server";
import { 
  getRedisClient, 
  getClientIP, 
  sanitizeInput, 
  validateMasterScore, 
  validatePlayerName, 
  validateGameSession, 
  validateMasterGameState,
  parseLeaderboardData
} from "@/lib/api-utils";

const redis = getRedisClient();



// GET: 리더보드 상위 5개만 반환
export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ leaderboard: [] });
    }
    // Sorted Set에서 상위 5개(score 내림차순)
    const results = await redis.zrange("tangerine_master_leaderboard", 0, 4, { rev: true, withScores: true });
    const leaderboard = parseLeaderboardData(results);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("귤림고수 게임 리더보드 조회 실패:", error);
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
    if (!gameState || !validateMasterGameState(gameState)) {
      return NextResponse.json(
        { error: "유효하지 않은 게임 상태입니다." },
        { status: 400 }
      );
    }
    if (!validateMasterScore(score)) {
      return NextResponse.json(
        { error: "유효하지 않은 점수입니다. (0-3600 사이의 정수만 허용)" },
        { status: 400 }
      );
    }
    
    // 점수와 게임 시간이 일치하는지 확인
    const gameStateSurvivalTime = gameState.survivalTime as number;
    if (Math.abs(score - gameStateSurvivalTime) > 1) { // 1초 차이까지 허용
      return NextResponse.json(
        { error: "점수와 게임 시간이 일치하지 않습니다." },
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

    // 리더보드에 점수 추가
    await redis.zadd("tangerine_master_leaderboard", {
      score,
      member: JSON.stringify({
        playerName: sanitizedPlayerName || `Player_${clientIP.slice(-4)}`,
        timestamp: new Date().toISOString()
      })
    });
    // 상위 5개만 반환
    const results = await redis.zrange("tangerine_master_leaderboard", 0, 4, { rev: true, withScores: true });
    const leaderboard = parseLeaderboardData(results);
    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error("귤림고수 게임 점수 저장 실패:", error);
    return NextResponse.json(
      { error: "점수를 저장할 수 없습니다." },
      { status: 500 }
    );
  }
} 