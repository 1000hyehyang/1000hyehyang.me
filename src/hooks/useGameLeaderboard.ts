"use client";

import { useCallback, useState } from "react";
import type { GameLeaderboardEntry } from "@/lib/game-leaderboard";

type UseGameLeaderboardResult = {
  showLeaderboard: boolean;
  setShowLeaderboard: (open: boolean) => void;
  leaderboard: GameLeaderboardEntry[];
  isLoading: boolean;
  fetchLeaderboard: () => Promise<void>;
  openLeaderboard: () => void;
};

/**
 * 천혜향 / 천혜향 마스터 공통: 리더보드 모달 상태 + API 조회
 */
export function useGameLeaderboard(apiUrl: string): UseGameLeaderboardResult {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) return;
      const data: unknown = await response.json();
      const raw =
        data &&
        typeof data === "object" &&
        "leaderboard" in data &&
        Array.isArray((data as { leaderboard: unknown }).leaderboard)
          ? (data as { leaderboard: GameLeaderboardEntry[] }).leaderboard
          : [];
      setLeaderboard(raw);
    } catch (error) {
      console.error("리더보드 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  const openLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    showLeaderboard,
    setShowLeaderboard,
    leaderboard,
    isLoading,
    fetchLeaderboard,
    openLeaderboard,
  };
}
