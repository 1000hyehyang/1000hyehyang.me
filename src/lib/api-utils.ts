import { headers } from "next/headers";
import { Redis } from "@upstash/redis";

// Redis 설정
export const getRedisClient = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;
};

// 클라이언트 IP 주소 가져오기
export const getClientIP = async (): Promise<string> => {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  return "localhost";
};

// 입력값 정제
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 20);
};

// 점수 유효성 검사 (천혜향 게임용)
export const validateTangerineScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 50000;
};

// 점수 유효성 검사 (귤림고수용)
export const validateMasterScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 3600;
};

// 플레이어명 유효성 검사
export const validatePlayerName = (name: string): boolean => {
  const validPattern = /^[가-힣a-zA-Z0-9\s]{1,20}$/;
  return validPattern.test(name);
};

// 게임 세션 유효성 검사
export const validateGameSession = async (sessionId: string, ip: string): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis || !sessionId) return false;
  
  try {
    const session = await redis.get(`session:${sessionId}`);
    if (!session) return false;
    
    const sessionData = session as { ip: string; createdAt: number; isValid: boolean };
    const timeDiff = Date.now() - sessionData.createdAt;
    
    // 세션 유효성, IP 일치, 10분 이내 확인
    return sessionData.isValid && 
           sessionData.ip === ip && 
           timeDiff < 600000; // 10분
  } catch (error) {
    console.error("게임 세션 검증 실패:", error);
    return false;
  }
};

// 천혜향 게임 상태 유효성 검사
export const validateTangerineGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== 'object') return false;
  
  // 필수 필드 확인
  const requiredFields = ['isPlaying', 'score', 'timeLeft', 'tangerines'];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }
  
  // 점수 범위 확인 (0-50000)
  const score = gameState.score as number;
  if (score <= 0 || score > 50000) return false;
  
  // 시간 범위 확인 (0-60초)
  const timeLeft = gameState.timeLeft as number;
  if (typeof timeLeft !== 'number' || timeLeft < 0 || timeLeft > 60) return false;
  
  // 귤 배열 유효성 확인 (최대 200개)
  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines) || tangerines.length > 200) return false;
  
  return true;
};

// 귤림고수 게임 상태 유효성 검사
export const validateMasterGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== 'object') return false;
  
  // 필수 게임 상태 필드 확인
  const requiredFields = ['isPlaying', 'survivalTime', 'player', 'tangerines', 'difficulty'];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }
  
  // 게임이 실제로 진행되었는지 확인
  const survivalTime = gameState.survivalTime as number;
  if (survivalTime <= 0 || survivalTime > 3600) return false; // 최대 1시간
  
  // 플레이어 정보가 유효한지 확인
  const player = gameState.player as Record<string, unknown>;
  if (!player || typeof (player.x as number) !== 'number' || typeof (player.y as number) !== 'number') {
    return false;
  }
  
  // 플레이어 위치가 게임 영역 내에 있는지 확인
  const playerX = player.x as number;
  const playerY = player.y as number;
  if (playerX < 0 || playerX > 800 || playerY < 0 || playerY > 600) {
    return false;
  }
  
  // 난이도가 유효한지 확인
  const difficulty = gameState.difficulty as number;
  if (typeof difficulty !== 'number' || difficulty < 0 || difficulty > 720) { // 최대 12분 (720초 / 5초)
    return false;
  }
  
  // 귤 배열이 유효한지 확인
  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines)) return false;
  
  // 귤 개수가 합리적인 범위인지 확인 (너무 많으면 조작 의심)
  if (tangerines.length > 100) return false;
  
  return true;
};

// 리더보드 데이터 파싱
export const parseLeaderboardData = (results: unknown[]): Array<{ score: number; [key: string]: unknown }> => {
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
  
  return leaderboard;
};
