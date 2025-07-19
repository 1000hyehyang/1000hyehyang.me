import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// 환경 변수가 없으면 null로 설정
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

interface TangerineGameScore {
  score: number;
  timestamp: string;
  playerName?: string;
}

interface TangerineGameLeaderboard {
  scores: TangerineGameScore[];
  lastUpdated: string;
}

const getClientIP = async (): Promise<string> => {
  const headersList = await headers();
  
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "127.0.0.1";
};

const getLeaderboard = async (): Promise<TangerineGameLeaderboard> => {
  if (!redis) {
    return {
      scores: [],
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const data = await redis.get("tangerine_game_leaderboard");
    if (data) {
      return data as TangerineGameLeaderboard;
    }
  } catch (error) {
    console.error("Redis에서 천혜향 게임 리더보드 조회 실패:", error);
  }
  
  return {
    scores: [],
    lastUpdated: new Date().toISOString()
  };
};

const setLeaderboard = async (leaderboard: TangerineGameLeaderboard): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    await redis.set("tangerine_game_leaderboard", leaderboard);
  } catch (error) {
    console.error("Redis에 천혜향 게임 리더보드 저장 실패:", error);
  }
};

const getPlayerScores = async (): Promise<TangerineGameScore[]> => {
  if (!redis) {
    return [];
  }

  try {
    const data = await redis.get("tangerine_game_player_scores");
    if (data) {
      return data as TangerineGameScore[];
    }
  } catch (error) {
    console.error("Redis에서 플레이어 점수 조회 실패:", error);
  }
  
  return [];
};

const setPlayerScores = async (scores: TangerineGameScore[]): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    await redis.set("tangerine_game_player_scores", scores);
  } catch (error) {
    console.error("Redis에 플레이어 점수 저장 실패:", error);
  }
};

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    const playerScores = await getPlayerScores();
    
    return NextResponse.json({
      leaderboard,
      playerScores
    });
  } catch (error) {
    console.error("천혜향 게임 점수 조회 실패:", error);
    return NextResponse.json(
      { error: "점수를 조회할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { score, playerName } = await request.json();
    const clientIP = await getClientIP();
    
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: "유효하지 않은 점수입니다." },
        { status: 400 }
      );
    }

    const newScore: TangerineGameScore = {
      score,
      timestamp: new Date().toISOString(),
      playerName: playerName || `Player_${clientIP.slice(-4)}`
    };

    // 리더보드 업데이트
    const leaderboard = await getLeaderboard();
    leaderboard.scores.push(newScore);
    leaderboard.scores.sort((a, b) => b.score - a.score);
    leaderboard.scores = leaderboard.scores.slice(0, 10); // 상위 10개만 유지
    leaderboard.lastUpdated = new Date().toISOString();
    
    await setLeaderboard(leaderboard);

    // 플레이어 개인 점수 저장
    const playerScores = await getPlayerScores();
    playerScores.push(newScore);
    playerScores.sort((a, b) => b.score - a.score);
    playerScores.splice(10); // 최근 10개만 유지
    
    await setPlayerScores(playerScores);

    return NextResponse.json({
      success: true,
      leaderboard,
      playerScores
    });
  } catch (error) {
    console.error("천혜향 게임 점수 저장 실패:", error);
    return NextResponse.json(
      { error: "점수를 저장할 수 없습니다." },
      { status: 500 }
    );
  }
} 