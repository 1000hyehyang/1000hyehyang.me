"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useTangerineGameStore } from "@/lib/tangerine-game";
import { useGameLeaderboard } from "@/hooks/useGameLeaderboard";
import { GameLeaderboardModal } from "@/components/game/GameLeaderboardModal";
import { GameControlToolbar, type GameAudioControl } from "@/components/game/GameControlToolbar";

interface GameControlsProps {
  bgMusic: GameAudioControl;
  sfxSound: GameAudioControl;
}

export interface GameControlsRef {
  refreshLeaderboard: () => void;
}

const LEADERBOARD_API = "/api/tangerine-game";

export const GameControls = forwardRef<GameControlsRef, GameControlsProps>(({ bgMusic, sfxSound }, ref) => {
  const { isPlaying, isPaused, startGame, pauseGame, resumeGame, resetGame } = useTangerineGameStore();

  const {
    showLeaderboard,
    setShowLeaderboard,
    leaderboard,
    isLoading,
    fetchLeaderboard,
    openLeaderboard,
  } = useGameLeaderboard(LEADERBOARD_API);

  useImperativeHandle(ref, () => ({
    refreshLeaderboard: fetchLeaderboard,
  }));

  const handleStart = () => {
    if (!isPlaying) startGame();
    else if (isPaused) resumeGame();
    else pauseGame();
  };

  return (
    <>
      <GameControlToolbar
        bgMusic={bgMusic}
        sfxSound={sfxSound}
        isPlaying={isPlaying}
        isPaused={isPaused}
        onStart={handleStart}
        onReset={resetGame}
        onOpenLeaderboard={openLeaderboard}
      />

      <GameLeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        isLoading={isLoading}
        entries={leaderboard}
        onRefresh={() => void fetchLeaderboard()}
        formatScore={(entry) => String(entry.score)}
      />
    </>
  );
});

GameControls.displayName = "GameControls";
