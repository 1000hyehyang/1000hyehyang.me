"use client";

import { forwardRef, useImperativeHandle } from "react";
import { formatSurvivalTime } from "@/lib/game-leaderboard";
import { useGameLeaderboard } from "@/hooks/useGameLeaderboard";
import { GameLeaderboardModal } from "@/components/game/GameLeaderboardModal";
import { GameControlToolbar, type GameAudioControl } from "@/components/game/GameControlToolbar";

interface TangerineMasterControlsProps {
  bgMusic: GameAudioControl;
  sfxSound: GameAudioControl;
  onStartGame?: () => void;
  onResetGame?: () => void;
  isPlaying?: boolean;
  isPaused?: boolean;
}

export interface TangerineMasterControlsRef {
  refreshLeaderboard: () => void;
}

const LEADERBOARD_API = "/api/tangerine-master";

export const TangerineMasterControls = forwardRef<TangerineMasterControlsRef, TangerineMasterControlsProps>(
  ({ bgMusic, sfxSound, onStartGame, onResetGame, isPlaying = false, isPaused = false }, ref) => {
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

    return (
      <>
        <GameControlToolbar
          bgMusic={bgMusic}
          sfxSound={sfxSound}
          isPlaying={isPlaying}
          isPaused={isPaused}
          onStart={() => onStartGame?.()}
          onReset={() => onResetGame?.()}
          onOpenLeaderboard={openLeaderboard}
        />

        <GameLeaderboardModal
          open={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          isLoading={isLoading}
          entries={leaderboard}
          onRefresh={() => void fetchLeaderboard()}
          formatScore={(entry) => formatSurvivalTime(entry.score)}
          playerNameMaxLength={20}
        />
      </>
    );
  }
);

TangerineMasterControls.displayName = "TangerineMasterControls";
