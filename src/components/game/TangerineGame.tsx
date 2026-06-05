"use client";
import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTangerineGameStore, type Tangerine, useSyncHighScoreWithLocalStorage } from "@/lib/tangerine-game";
import { TangerineGrid } from "./TangerineGrid";
import { GameControls, type GameControlsRef } from "./GameControls";
import { GameStats } from "./GameStats";
import { GiscusComments } from "@/components/common/GiscusComments";
import { GISCUS_GAME_CONFIG } from "@/lib/config";
import { TANGERINE_GAME } from "@/lib/game-config";
import {
  useOrientation,
  useGameOver,
  useGameAudio,
  useGameLeaderboardRegistration,
} from "@/hooks/useGameCommon";
import { GameOverModal } from "./GameOverModal";
import { PortraitOrientationGuide } from "./PortraitOrientationGuide";
import { GameInstructions } from "./GameInstructions";
import { GamePageTitle } from "./GamePageTitle";

export const TangerineGame = () => {
  useSyncHighScoreWithLocalStorage();
  const {
    isPlaying,
    isPaused,
    score,
    timeLeft,
    selectTangerine,
    updateTime,
    generateNewGrid,
    highScore,
  } = useTangerineGameStore();

  const isPortrait = useOrientation();
  const gameOverState = useGameOver();
  const { setOriginalHighScore, setShowGameOver, showGameOver } = gameOverState;
  const { bgMusic, sfxSound } = useGameAudio(
    TANGERINE_GAME.audio.bgm,
    TANGERINE_GAME.audio.sfx
  );

  const gameControlsRef = useRef<GameControlsRef>(null);
  const prevIsPlayingRef = useRef(false);
  const gameOverHandledRef = useRef(false);
  const isNewRecord = score > gameOverState.originalHighScore && score > 0;

  const buildGameState = useCallback(
    () => ({
      isPlaying: false,
      score,
      timeLeft,
      tangerines: useTangerineGameStore.getState().tangerines,
    }),
    [score, timeLeft]
  );

  const {
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
  } = useGameLeaderboardRegistration({
    apiUrl: TANGERINE_GAME.apiUrl,
    sessionUrl: TANGERINE_GAME.sessionUrl,
    score,
    isNewRecord,
    showGameOver,
    gameOverState,
    buildGameState,
    onRefreshLeaderboard: () => gameControlsRef.current?.refreshLeaderboard(),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        updateTime();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, isPaused, timeLeft, updateTime]);

  useEffect(() => {
    generateNewGrid();
  }, [generateNewGrid]);

  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      gameOverHandledRef.current = false;
      setOriginalHighScore(highScore);
      void createSession();
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, highScore, setOriginalHighScore, createSession]);

  useEffect(() => {
    if (timeLeft <= 0 && !showGameOver && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver, setShowGameOver]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      bgMusic.play();
    }
  }, [isPlaying, isPaused, bgMusic]);

  const handleTangerineClick = (tangerine: Tangerine) => {
    if (isPlaying && !isPaused) {
      selectTangerine(tangerine);
    }
  };

  if (isPortrait) {
    return (
      <PortraitOrientationGuide
        title={TANGERINE_GAME.title}
        description={TANGERINE_GAME.portraitDescription}
        tips={TANGERINE_GAME.portraitTips}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GamePageTitle title={TANGERINE_GAME.title} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <GameStats />
      </motion.div>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GameControls
          ref={gameControlsRef}
          bgMusic={{
            toggleMute: bgMusic.toggleMute,
            isMuted: bgMusic.isMuted,
          }}
          sfxSound={{
            toggleMute: sfxSound.toggleMute,
            isMuted: sfxSound.isMuted,
          }}
        />
      </motion.div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TangerineGrid onTangerineClick={handleTangerineClick} />
      </motion.div>

      <GameOverModal
        isOpen={showGameOver}
        scoreDisplay={
          <p className="text-lg mb-2">
            최종 점수: <span className="font-semibold">{score}</span>
          </p>
        }
        isNewRecord={isNewRecord}
        previewRank={previewRank}
        previewInHallOfFame={previewInHallOfFame}
        isRankLoading={isRankLoading}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        isSaving={isSaving}
        saveError={saveError}
        onRegister={handleRegister}
        onClose={handleCloseGameOver}
      />

      <GameInstructions rules={TANGERINE_GAME.rules} />

      <GiscusComments
        repo={GISCUS_GAME_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_GAME_CONFIG.repoId}
        category={GISCUS_GAME_CONFIG.category}
        categoryId={GISCUS_GAME_CONFIG.categoryId}
        term={TANGERINE_GAME.giscusTerm}
      />
    </div>
  );
};
