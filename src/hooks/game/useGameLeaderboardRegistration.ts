import { useEffect, useCallback } from "react";
import { useGameSession } from "./useGameSession";
import { useScoreSave } from "./useScoreSave";
import { useGameOverRankPreview } from "./useGameOverRankPreview";
import { generateDefaultPlayerName } from "@/lib/nanangi-player-names";
import type { useGameOver } from "./useGameOver";

type GameOverState = ReturnType<typeof useGameOver>;

type UseGameLeaderboardRegistrationOptions = {
  apiUrl: string;
  sessionUrl: string;
  score: number;
  isNewRecord: boolean;
  showGameOver: boolean;
  gameOverState: GameOverState;
  buildGameState: () => Record<string, unknown>;
  onRefreshLeaderboard: () => void;
  onCloseExtra?: () => void;
};

export const useGameLeaderboardRegistration = ({
  apiUrl,
  sessionUrl,
  score,
  isNewRecord,
  showGameOver,
  gameOverState,
  buildGameState,
  onRefreshLeaderboard,
  onCloseExtra,
}: UseGameLeaderboardRegistrationOptions) => {
  const { playerName, setPlayerName, handleGameOverClose } = gameOverState;
  const { createSession, clearSession, getSessionId } = useGameSession(sessionUrl);
  const { isSaving, saveError, saveScore, resetSaveState } = useScoreSave();
  const {
    rank: previewRank,
    inHallOfFame: previewInHallOfFame,
    isLoading: isRankLoading,
  } = useGameOverRankPreview(apiUrl, score, showGameOver && isNewRecord);

  const handleSaveScore = useCallback(
    async (name: string, options?: { allowResave?: boolean }) => {
      let sessionId = getSessionId();

      if (!sessionId) {
        const created = await createSession();
        if (!created) return { success: false as const };
        sessionId = getSessionId();
      }

      const result = await saveScore(
        score,
        name,
        buildGameState(),
        apiUrl,
        sessionId,
        options
      );

      if (result.success) {
        if (!options?.allowResave) {
          clearSession();
        }
        onRefreshLeaderboard();
      }

      return result;
    },
    [
      score,
      buildGameState,
      apiUrl,
      getSessionId,
      createSession,
      saveScore,
      clearSession,
      onRefreshLeaderboard,
    ]
  );

  const handleCloseGameOver = useCallback(() => {
    handleGameOverClose();
    resetSaveState();
    clearSession();
    onCloseExtra?.();
  }, [handleGameOverClose, resetSaveState, clearSession, onCloseExtra]);

  const handleRegister = useCallback(async () => {
    if (!playerName.trim()) return;
    const result = await handleSaveScore(playerName);
    if (result.success) {
      handleCloseGameOver();
    }
  }, [playerName, handleSaveScore, handleCloseGameOver]);

  useEffect(() => {
    if (!showGameOver || !isNewRecord) return;
    if (!playerName) {
      setPlayerName(generateDefaultPlayerName());
    }
    if (!getSessionId()) {
      void createSession();
    }
  }, [showGameOver, isNewRecord, playerName, setPlayerName, getSessionId, createSession]);

  return {
    playerName,
    setPlayerName,
    isSaving,
    saveError,
    previewRank,
    previewInHallOfFame,
    isRankLoading,
    handleRegister,
    handleCloseGameOver,
    createSession,
  };
};
