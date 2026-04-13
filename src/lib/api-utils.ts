import { headers } from "next/headers";
import { Redis } from "@upstash/redis";

export const getRedisClient = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;
};

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

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, 20);
};

export const validateTangerineScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 50000;
};

export const validateMasterScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 3600;
};

export const validatePlayerName = (name: string): boolean => {
  const validPattern = /^[가-힣a-zA-Z0-9\s]{1,20}$/;
  return validPattern.test(name);
};

export const validateGameSession = async (sessionId: string, ip: string): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis || !sessionId) return false;

  try {
    const session = await redis.get(`session:${sessionId}`);
    if (!session) return false;

    const sessionData = session as { ip: string; createdAt: number; isValid: boolean };
    const timeDiff = Date.now() - sessionData.createdAt;

    return sessionData.isValid && sessionData.ip === ip && timeDiff < 600000;
  } catch (error) {
    console.error("게임 세션 검증 실패:", error);
    return false;
  }
};

export const validateTangerineGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== "object") return false;

  const requiredFields = ["isPlaying", "score", "timeLeft", "tangerines"];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }

  const score = gameState.score as number;
  if (score <= 0 || score > 50000) return false;

  const timeLeft = gameState.timeLeft as number;
  if (typeof timeLeft !== "number" || timeLeft < 0 || timeLeft > 60) return false;

  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines) || tangerines.length > 200) return false;

  return true;
};

export const validateMasterGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== "object") return false;

  const requiredFields = ["isPlaying", "survivalTime", "player", "tangerines", "difficulty"];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }

  const survivalTime = gameState.survivalTime as number;
  if (survivalTime <= 0 || survivalTime > 3600) return false;

  const player = gameState.player as Record<string, unknown>;
  if (!player || typeof (player.x as number) !== "number" || typeof (player.y as number) !== "number") {
    return false;
  }

  const playerX = player.x as number;
  const playerY = player.y as number;
  if (playerX < 0 || playerX > 800 || playerY < 0 || playerY > 600) {
    return false;
  }

  const difficulty = gameState.difficulty as number;
  if (typeof difficulty !== "number" || difficulty < 0 || difficulty > 720) {
    return false;
  }

  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines)) return false;

  if (tangerines.length > 100) return false;

  return true;
};

export const parseLeaderboardData = (
  results: unknown[]
): Array<{ score: number; [key: string]: unknown }> => {
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
      score: Number(results[i + 1]),
    });
  }

  return leaderboard;
};
