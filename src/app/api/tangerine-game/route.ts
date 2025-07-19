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

interface RecentScores {
  [ip: string]: {
    lastSaved: string;
    lastScore: number;
  };
}

// XSS 방지를 위한 입력 검증 함수
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
    .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
    .trim()
    .slice(0, 20); // 최대 20자로 제한
};

// 점수 유효성 검증 함수
const validateScore = (score: number): boolean => {
  // 점수는 0 이상 10000 이하의 정수만 허용
  return Number.isInteger(score) && score >= 0 && score <= 10000;
};

// 플레이어명 유효성 검증 함수
const validatePlayerName = (name: string): boolean => {
  // 한글, 영문, 숫자, 공백만 허용 (특수문자 제한)
  const validPattern = /^[가-힣a-zA-Z0-9\s]{1,20}$/;
  return validPattern.test(name);
};

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
  
  // IPv6 루프백 주소도 localhost로 처리
  return "localhost";
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

const getRecentScores = async (): Promise<RecentScores> => {
  if (!redis) {
    return {};
  }

  try {
    const data = await redis.get("tangerine_game_recent_scores");
    if (data) {
      return data as RecentScores;
    }
  } catch (error) {
    console.error("Redis에서 최근 점수 조회 실패:", error);
  }
  
  return {};
};

const setRecentScores = async (recentScores: RecentScores): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    await redis.set("tangerine_game_recent_scores", recentScores);
  } catch (error) {
    console.error("Redis에 최근 점수 저장 실패:", error);
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
    const body = await request.json();
    const { score, playerName } = body;
    const clientIP = await getClientIP();
    
    // 요청 본문 검증
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }

    // 점수 유효성 검증
    if (!validateScore(score)) {
      return NextResponse.json(
        { error: "유효하지 않은 점수입니다. (0-10000 사이의 정수만 허용)" },
        { status: 400 }
      );
    }

    // 플레이어명 검증 및 정제
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
      const isRecent = timeDiff < 30000; // 30초
      const isSameScore = ipData.lastScore === score;
      
      if (isRecent && isSameScore) {
        return NextResponse.json(
          { error: "같은 점수는 30초 후에 다시 저장할 수 있습니다." },
          { status: 429 }
        );
      }
    }

    const newScore: TangerineGameScore = {
      score,
      timestamp: new Date().toISOString(),
      playerName: sanitizedPlayerName || `Player_${clientIP.slice(-4)}`
    };

    // 최근 저장 기록 업데이트
    recentScores[clientIP] = {
      lastSaved: new Date().toISOString(),
      lastScore: score
    };
    await setRecentScores(recentScores);

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