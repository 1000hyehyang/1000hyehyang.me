import { useState, useCallback } from "react";
import type { SaveScoreResult } from "@/lib/game-leaderboard";

export const useScoreSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetSaveState = useCallback(() => {
    setHasSaved(false);
    setSaveError(null);
  }, []);

  const saveScore = async (
    score: number,
    playerName: string,
    gameState: Record<string, unknown>,
    apiEndpoint: string,
    gameSessionId: string | null,
    options?: { allowResave?: boolean }
  ): Promise<SaveScoreResult> => {
    if (isSaving) return { success: false };
    if (hasSaved && !options?.allowResave) return { success: false };

    if (!gameSessionId) {
      setSaveError("게임 세션이 없습니다. 게임을 다시 시작해주세요.");
      return { success: false };
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          playerName: playerName.trim() || undefined,
          gameSessionId,
          gameState,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setHasSaved(true);
        const rank = typeof (data as { rank?: unknown }).rank === "number"
          ? (data as { rank: number }).rank
          : undefined;
        const inHallOfFame = Boolean((data as { inHallOfFame?: unknown }).inHallOfFame);
        return { success: true, rank, inHallOfFame };
      }

      const message =
        (data as { error?: string }).error ?? "점수를 저장할 수 없습니다.";
      setSaveError(message);
      console.error("점수 저장 실패:", message);
      return { success: false };
    } catch (error) {
      console.error("점수 저장 중 오류:", error);
      setSaveError("네트워크 오류가 발생했습니다.");
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, hasSaved, saveError, saveScore, resetSaveState };
};
