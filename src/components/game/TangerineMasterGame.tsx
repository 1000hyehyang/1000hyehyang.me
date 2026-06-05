"use client";
import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTangerineMasterGame, useSyncHighScoreWithLocalStorage } from "@/lib/tangerine-master";
import { TangerineMasterCanvas } from "./TangerineMasterCanvas";
import { TangerineMasterControls, TangerineMasterControlsRef } from "./TangerineMasterControls";
import { TangerineMasterStats } from "./TangerineMasterStats";
import { GiscusComments } from "@/components/common/GiscusComments";
import { GISCUS_GAME_CONFIG } from "@/lib/config";
import { MASTER_GAME } from "@/lib/game-config";
import {
  useOrientation,
  useGameOver,
  useGameAudio,
  useGameLeaderboardRegistration,
} from "@/hooks/useGameCommon";
import { useAudio } from "@/hooks/useAudio";
import { GameOverModal } from "./GameOverModal";
import { PortraitOrientationGuide } from "./PortraitOrientationGuide";
import { GameInstructions } from "./GameInstructions";
import { GamePageTitle } from "./GamePageTitle";

const GAME_MOVEMENT_KEYS = ["w", "W", "a", "A", "s", "S", "d", "D"];
const HIT_WAVE_WARNING_SFX_MS = 2500;
const HIT_WAVE_WARNING_FADE_MS = 900;

export const TangerineMasterGame = () => {
  const gameState = useTangerineMasterGame();
  const { setHighScore, resetGame } = gameState;
  const { highScore, updateHighScore } = useSyncHighScoreWithLocalStorage();
  const controlsRef = useRef<TangerineMasterControlsRef>(null);

  const isPortrait = useOrientation();
  const gameOverState = useGameOver();
  const { setOriginalHighScore, setShowGameOver, showGameOver } = gameOverState;
  const { bgMusic, sfxSound } = useGameAudio(
    MASTER_GAME.audio.bgm,
    MASTER_GAME.audio.sfx
  );
  const warningSound = useAudio({
    src: MASTER_GAME.audio.warning ?? "/tangerine-master/warning.mp3",
    loop: false,
    volume: 0.5,
  });

  const prevIsPlayingRef = useRef(false);
  const lastHitWaveStartRef = useRef<number | null>(null);
  const hitWaveWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameOverHandledRef = useRef(false);
  const finalScore = Math.floor(gameState.survivalTime);
  const isNewRecord = finalScore > gameOverState.originalHighScore && finalScore > 0;

  const buildGameState = useCallback(
    () => ({
      isPlaying: false,
      survivalTime: gameState.survivalTime,
      player: gameState.player,
      tangerines: gameState.tangerines,
      difficulty: gameState.difficulty,
    }),
    [gameState.survivalTime, gameState.player, gameState.tangerines, gameState.difficulty]
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
    apiUrl: MASTER_GAME.apiUrl,
    sessionUrl: MASTER_GAME.sessionUrl,
    score: finalScore,
    isNewRecord,
    showGameOver,
    gameOverState,
    buildGameState,
    onRefreshLeaderboard: () => controlsRef.current?.refreshLeaderboard(),
    onCloseExtra: resetGame,
  });

  const handleStartGame = () => {
    if (!gameState.isPlaying) {
      setOriginalHighScore(highScore);
      gameState.startGame();

      if (!bgMusic.isMuted) {
        bgMusic.play();
      }
    } else if (gameState.isPaused) {
      gameState.resumeGame();
    } else {
      gameState.pauseGame();
    }
  };

  const handleGameOver = useCallback(() => {
    if (gameState.survivalTime > 0) {
      setShowGameOver(true);
      updateHighScore(gameState.survivalTime);
      if (!sfxSound.isMuted) {
        sfxSound.play();
      }
    }
  }, [gameState.survivalTime, updateHighScore, sfxSound, setShowGameOver]);

  useEffect(() => {
    if (gameState.isPlaying && !prevIsPlayingRef.current) {
      gameOverHandledRef.current = false;
      void createSession();
    }
    prevIsPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying, createSession]);

  useEffect(() => {
    if (
      !gameState.isPlaying &&
      gameState.survivalTime > 0 &&
      !showGameOver &&
      !gameOverHandledRef.current
    ) {
      gameOverHandledRef.current = true;
      handleGameOver();
    }
  }, [gameState.isPlaying, gameState.survivalTime, handleGameOver, showGameOver]);

  useEffect(() => {
    setHighScore(highScore);
  }, [highScore, setHighScore]);

  useEffect(() => {
    warningSound.setMuted(sfxSound.isMuted);
  }, [sfxSound.isMuted]);

  useEffect(() => {
    if (!gameState.isPlaying) {
      lastHitWaveStartRef.current = null;
      if (hitWaveWarningTimerRef.current) {
        clearTimeout(hitWaveWarningTimerRef.current);
        hitWaveWarningTimerRef.current = null;
      }
      warningSound.stop();
      return;
    }

    const hitWave = gameState.hitWave;
    if (!hitWave || gameState.isPaused) return;
    if (lastHitWaveStartRef.current === hitWave.startedAt) return;

    lastHitWaveStartRef.current = hitWave.startedAt;

    if (hitWaveWarningTimerRef.current) {
      clearTimeout(hitWaveWarningTimerRef.current);
    }

    warningSound.stop();
    if (!sfxSound.isMuted) {
      warningSound.play();
      hitWaveWarningTimerRef.current = setTimeout(() => {
        warningSound.fadeOut(HIT_WAVE_WARNING_FADE_MS);
        hitWaveWarningTimerRef.current = null;
      }, HIT_WAVE_WARNING_SFX_MS - HIT_WAVE_WARNING_FADE_MS);
    }

    return () => {
      if (hitWaveWarningTimerRef.current) {
        clearTimeout(hitWaveWarningTimerRef.current);
        hitWaveWarningTimerRef.current = null;
      }
    };
  }, [gameState.hitWave, gameState.isPlaying, gameState.isPaused, sfxSound.isMuted]);

  if (isPortrait) {
    return (
      <PortraitOrientationGuide
        title={MASTER_GAME.title}
        description={MASTER_GAME.portraitDescription}
        tips={MASTER_GAME.portraitTips}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GamePageTitle title={MASTER_GAME.title} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <TangerineMasterStats survivalTime={gameState.survivalTime} highScore={highScore} />
      </motion.div>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TangerineMasterControls
          ref={controlsRef}
          bgMusic={bgMusic}
          sfxSound={sfxSound}
          onStartGame={handleStartGame}
          onResetGame={gameState.resetGame}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
        />
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TangerineMasterCanvas
          tangerines={gameState.tangerines}
          spawnWarnings={gameState.spawnWarnings}
          hitWave={gameState.hitWave}
          player={gameState.player}
          gameArea={gameState.gameArea}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
        />
      </motion.div>

      <GameOverModal
        isOpen={showGameOver}
        scoreDisplay={
          <p className="text-lg mb-2">
            생존 시간: <span className="font-semibold">{finalScore}초</span>
          </p>
        }
        isNewRecord={isNewRecord}
        previewRank={previewRank}
        previewInHallOfFame={previewInHallOfFame}
        isRankLoading={isRankLoading}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onPlayerNameKeyDown={(e) => {
          if (GAME_MOVEMENT_KEYS.includes(e.key)) {
            e.stopPropagation();
          }
        }}
        isSaving={isSaving}
        saveError={saveError}
        onRegister={handleRegister}
        onClose={handleCloseGameOver}
      />

      <GameInstructions rules={MASTER_GAME.rules} />

      <GiscusComments
        repo={GISCUS_GAME_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_GAME_CONFIG.repoId}
        category={GISCUS_GAME_CONFIG.category}
        categoryId={GISCUS_GAME_CONFIG.categoryId}
        term={MASTER_GAME.giscusTerm}
      />
    </div>
  );
};
