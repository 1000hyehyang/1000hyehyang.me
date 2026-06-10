import "server-only";

import { NextResponse } from "next/server";
import {
  type GameId,
  getClientIP,
  sanitizeInput,
  validateTangerineScore,
  validateMasterScore,
  validateTangerineGameState,
  validateMasterGameState,
  validateGameSession,
  invalidateGameSession,
  checkAndIncrementRateLimit,
  addToLeaderboard,
  getLeaderboardRank,
  getRankForScore,
  getTopLeaderboard,
  getDefaultPlayerName,
  getSessionKey,
  getRedisClient,
  LEADERBOARD_KEYS,
  LEADERBOARD_DISPLAY_COUNT,
  SESSION_TTL_SECONDS,
} from "@/lib/api-utils";

export type ScoreValidationConfig = {
  gameId: GameId;
  logLabel: string;
  validateScore: (score: number) => boolean;
  invalidScoreMessage: string;
  validateGameState: (gameState: Record<string, unknown>) => boolean;
  assertScoreMatchesState: (
    score: number,
    gameState: Record<string, unknown>
  ) => string | null;
};

const leaderboardKey = (gameId: GameId) => LEADERBOARD_KEYS[gameId];

export async function handleGameLeaderboardGet(
  request: Request,
  config: ScoreValidationConfig
) {
  const redis = getRedisClient();
  const scoreParam = new URL(request.url).searchParams.get("score");

  try {
    if (scoreParam !== null) {
      const score = Number(scoreParam);
      if (!config.validateScore(score)) {
        return NextResponse.json(
          { error: "유효하지 않은 점수입니다." },
          { status: 400 }
        );
      }

      if (!redis) {
        return NextResponse.json({ rank: null, inHallOfFame: false });
      }

      const rank = await getRankForScore(redis, leaderboardKey(config.gameId), score);
      return NextResponse.json({
        rank,
        inHallOfFame: rank <= LEADERBOARD_DISPLAY_COUNT,
      });
    }

    if (!redis) {
      return NextResponse.json({ leaderboard: [] });
    }

    const leaderboard = await getTopLeaderboard(redis, leaderboardKey(config.gameId));
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error(`${config.logLabel} 리더보드 조회 실패:`, error);
    return NextResponse.json(
      { error: "리더보드를 조회할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function handleGameScorePost(
  request: Request,
  config: ScoreValidationConfig
) {
  const redis = getRedisClient();

  try {
    if (!redis) {
      return NextResponse.json({ error: "Redis 미설정" }, { status: 500 });
    }

    const clientIP = await getClientIP();
    const body = await request.json();
    const { score, playerName, gameSessionId, gameState } = body;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }

    if (!gameSessionId || typeof gameSessionId !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 게임 세션입니다." },
        { status: 401 }
      );
    }

    const isValidSession = await validateGameSession(
      config.gameId,
      gameSessionId,
      clientIP
    );
    if (!isValidSession) {
      return NextResponse.json(
        { error: "게임 세션이 유효하지 않습니다. 게임을 다시 시작해주세요." },
        { status: 401 }
      );
    }

    if (!gameState || !config.validateGameState(gameState)) {
      return NextResponse.json(
        { error: "유효하지 않은 게임 상태입니다." },
        { status: 400 }
      );
    }

    if (!config.validateScore(score)) {
      return NextResponse.json(
        { error: config.invalidScoreMessage },
        { status: 400 }
      );
    }

    const scoreMismatch = config.assertScoreMatchesState(score, gameState);
    if (scoreMismatch) {
      return NextResponse.json({ error: scoreMismatch }, { status: 400 });
    }

    const withinRateLimit = await checkAndIncrementRateLimit(
      redis,
      config.gameId,
      clientIP
    );
    if (!withinRateLimit) {
      return NextResponse.json(
        { error: "점수 등록 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    let sanitizedPlayerName = "";
    if (playerName && typeof playerName === "string") {
      sanitizedPlayerName = sanitizeInput(playerName);
    }

    const key = leaderboardKey(config.gameId);
    const member = await addToLeaderboard(redis, key, score, {
      playerName: sanitizedPlayerName || getDefaultPlayerName(clientIP),
      timestamp: new Date().toISOString(),
    });

    const rank = await getLeaderboardRank(redis, key, member);
    const leaderboard = await getTopLeaderboard(redis, key);

    await invalidateGameSession(config.gameId, gameSessionId);

    return NextResponse.json({
      success: true,
      leaderboard,
      rank,
      inHallOfFame: rank !== null && rank <= LEADERBOARD_DISPLAY_COUNT,
    });
  } catch (error) {
    console.error(`${config.logLabel} 점수 저장 실패:`, error);
    return NextResponse.json(
      { error: "점수를 저장할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function handleGameSessionPost(request: Request, gameId: GameId) {
  const redis = getRedisClient();

  try {
    if (!redis) {
      return NextResponse.json({ error: "Redis 미설정" }, { status: 500 });
    }

    const clientIP = await getClientIP();
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 세션 ID입니다." },
        { status: 400 }
      );
    }

    await redis.setex(getSessionKey(gameId, sessionId), SESSION_TTL_SECONDS, {
      ip: clientIP,
      createdAt: Date.now(),
      isValid: true,
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

export const TANGERINE_SCORE_CONFIG: ScoreValidationConfig = {
  gameId: "tangerine",
  logLabel: "천혜향 게임",
  validateScore: validateTangerineScore,
  invalidScoreMessage: "유효하지 않은 점수입니다. (1-50000 사이의 정수만 허용)",
  validateGameState: validateTangerineGameState,
  assertScoreMatchesState: (score, gameState) => {
    const gameStateScore = gameState.score as number;
    return score !== gameStateScore ? "점수가 게임 상태와 일치하지 않습니다." : null;
  },
};

export const MASTER_SCORE_CONFIG: ScoreValidationConfig = {
  gameId: "master",
  logLabel: "귤림고수 게임",
  validateScore: validateMasterScore,
  invalidScoreMessage: "유효하지 않은 점수입니다. (1-3600 사이의 정수만 허용)",
  validateGameState: validateMasterGameState,
  assertScoreMatchesState: (score, gameState) => {
    const survivalTime = gameState.survivalTime as number;
    return Math.abs(score - survivalTime) > 1
      ? "점수와 게임 시간이 일치하지 않습니다."
      : null;
  },
};
