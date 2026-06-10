import { useState, useCallback, useRef } from "react";
import type { SaveScoreResult } from "@/lib/game-leaderboard";

export const useScoreSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  const hasSavedRef = useRef(false);

  const resetSaveState = useCallback(() => {
    hasSavedRef.current = false;
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
    if (isSavingRef.current) {
      return { success: false, error: "저장 중입니다." };
    }
    if (hasSavedRef.current && !options?.allowResave) {
      const message = "이미 등록된 점수입니다.";
      setSaveError(message);
      return { success: false, error: message };
    }

    if (!gameSessionId) {
      const message = "게임 세션이 없습니다. 게임을 다시 시작해주세요.";
      setSaveError(message);
      return { success: false, error: message };
    }

    isSavingRef.current = true;
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
        hasSavedRef.current = true;
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
      return { success: false, error: message };
    } catch (error) {
      console.error("점수 저장 중 오류:", error);
      const message = "네트워크 오류가 발생했습니다.";
      setSaveError(message);
      return { success: false, error: message };
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return { isSaving, hasSaved, saveError, saveScore, resetSaveState };
};
