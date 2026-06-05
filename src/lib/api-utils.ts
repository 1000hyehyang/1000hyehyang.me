import { headers } from "next/headers";
import { Redis } from "@upstash/redis";

export type GameId = "tangerine" | "master";

export const LEADERBOARD_KEYS: Record<GameId, string> = {
  tangerine: "tangerine_leaderboard",
  master: "tangerine_master_leaderboard",
};

export const LEADERBOARD_MAX_ENTRIES = 100;
export const LEADERBOARD_DISPLAY_COUNT = 5;
export const SESSION_TTL_SECONDS = 600;
export const SESSION_MAX_AGE_MS = 600_000;
export const RATE_LIMIT_MAX_SUBMISSIONS = 10;
export const RATE_LIMIT_WINDOW_SECONDS = 3600;

export const getRedisClient = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;
};

export const getSessionKey = (gameId: GameId, sessionId: string): string =>
  `session:${gameId}:${sessionId}`;

export const getRateLimitKey = (gameId: GameId, ip: string): string =>
  `ratelimit:${gameId}:${ip}`;

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

import { generateDefaultPlayerName } from "@/lib/nanangi-player-names";

export const getDefaultPlayerName = (_ip: string): string =>
  generateDefaultPlayerName();

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, 20);
};

export const validateTangerineScore = (score: number): boolean => {
  return Number.isInteger(score) && score > 0 && score <= 50000;
};

export const validateMasterScore = (score: number): boolean => {
  return Number.isInteger(score) && score > 0 && score <= 3600;
};

export const validateGameSession = async (
  gameId: GameId,
  sessionId: string,
  ip: string
): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis || !sessionId) return false;

  try {
    const session = await redis.get(getSessionKey(gameId, sessionId));
    if (!session) return false;

    const sessionData = session as { ip: string; createdAt: number; isValid: boolean };
    const timeDiff = Date.now() - sessionData.createdAt;

    return sessionData.isValid && sessionData.ip === ip && timeDiff < SESSION_MAX_AGE_MS;
  } catch (error) {
    console.error("게임 세션 검증 실패:", error);
    return false;
  }
};

export const invalidateGameSession = async (
  gameId: GameId,
  sessionId: string
): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;
  await redis.del(getSessionKey(gameId, sessionId));
};

export const checkAndIncrementRateLimit = async (
  redis: Redis,
  gameId: GameId,
  ip: string
): Promise<boolean> => {
  const key = getRateLimitKey(gameId, ip);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  return count <= RATE_LIMIT_MAX_SUBMISSIONS;
};

export const validateTangerineGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== "object") return false;

  const requiredFields = ["isPlaying", "score", "timeLeft", "tangerines"];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }

  if (gameState.isPlaying !== false) return false;

  const score = gameState.score as number;
  if (!Number.isInteger(score) || score <= 0 || score > 50000) return false;

  const timeLeft = gameState.timeLeft as number;
  if (!Number.isInteger(timeLeft) || timeLeft < 0 || timeLeft > 60) return false;

  const tangerines = gameState.tangerines as unknown[];
  if (!Array.isArray(tangerines) || tangerines.length === 0 || tangerines.length > 20) {
    return false;
  }

  for (const row of tangerines) {
    if (!Array.isArray(row) || row.length === 0 || row.length > 20) return false;
  }

  return true;
};

export const validateMasterGameState = (gameState: Record<string, unknown>): boolean => {
  if (!gameState || typeof gameState !== "object") return false;

  const requiredFields = ["isPlaying", "survivalTime", "player", "tangerines", "difficulty"];
  for (const field of requiredFields) {
    if (!(field in gameState)) return false;
  }

  if (gameState.isPlaying !== false) return false;

  const survivalTime = gameState.survivalTime as number;
  if (typeof survivalTime !== "number" || survivalTime <= 0 || survivalTime > 3600) {
    return false;
  }

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
  if (!Array.isArray(tangerines) || tangerines.length > 100) return false;

  return true;
};

export const addToLeaderboard = async (
  redis: Redis,
  leaderboardKey: string,
  score: number,
  memberData: { playerName: string; timestamp: string }
): Promise<string> => {
  const member = JSON.stringify(memberData);

  await redis.zadd(leaderboardKey, { score, member });
  await redis.zremrangebyrank(leaderboardKey, 0, -(LEADERBOARD_MAX_ENTRIES + 1));

  return member;
};

export const getLeaderboardRank = async (
  redis: Redis,
  leaderboardKey: string,
  member: string
): Promise<number | null> => {
  const rank = await redis.zrevrank(leaderboardKey, member);
  if (rank === null || rank === undefined) return null;
  return rank + 1;
};

/** 등록 전 점수 기준 예상 순위 (더 높은 점수 개수 + 1) */
export const getRankForScore = async (
  redis: Redis,
  leaderboardKey: string,
  score: number
): Promise<number> => {
  const higherCount = await redis.zcount(leaderboardKey, score + 1, "+inf");
  return higherCount + 1;
};

export const getTopLeaderboard = async (redis: Redis, leaderboardKey: string) => {
  const results = await redis.zrange(leaderboardKey, 0, LEADERBOARD_DISPLAY_COUNT - 1, {
    rev: true,
    withScores: true,
  });
  return parseLeaderboardData(results);
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
