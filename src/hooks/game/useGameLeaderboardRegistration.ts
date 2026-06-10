import { useEffect, useCallback } from "react";
import { useGameSession } from "./useGameSession";
import { useScoreSave } from "./useScoreSave";
import { useGameOverRankPreview } from "./useGameOverRankPreview";
import { generateDefaultPlayerName } from "@/lib/nanangi-player-names";
import type { useGameOver } from "./useGameOver";

type GameOverState = ReturnType<typeof useGameOver>;

const SESSION_INVALID_ERROR =
  "게임 세션이 유효하지 않습니다. 게임을 다시 시작해주세요.";

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
      const ensureSessionId = async (): Promise<string | null> => {
        const sessionId = getSessionId();
        if (sessionId) return sessionId;

        const created = await createSession();
        if (!created) return null;
        return getSessionId();
      };

      let sessionId = await ensureSessionId();
      if (!sessionId) return { success: false as const };

      let result = await saveScore(
        score,
        name,
        buildGameState(),
        apiUrl,
        sessionId,
        options
      );

      if (!result.success && result.error === SESSION_INVALID_ERROR) {
        clearSession();
        sessionId = await ensureSessionId();
        if (sessionId) {
          result = await saveScore(
            score,
            name,
            buildGameState(),
            apiUrl,
            sessionId,
            options
          );
        }
      }

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
    setPlayerName(generateDefaultPlayerName());
    clearSession();
    void createSession();
  }, [showGameOver, isNewRecord, setPlayerName, clearSession, createSession]);

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
