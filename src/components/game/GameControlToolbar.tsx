"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { handleKeyDown } from "@/lib/utils";

export type GameAudioControl = {
  toggleMute: () => void;
  isMuted: boolean;
};

type GameControlToolbarProps = {
  bgMusic: GameAudioControl;
  sfxSound: GameAudioControl;
  isPlaying: boolean;
  isPaused: boolean;
  onStart: () => void;
  onReset: () => void;
  onOpenLeaderboard: () => void;
};

const BTN_PRIMARY =
  "flex cursor-pointer touch-manipulation items-center gap-2 rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90";

const BTN_MUTED =
  "flex cursor-pointer touch-manipulation items-center gap-2 rounded bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80";

function startPauseIcon(isPlaying: boolean, isPaused: boolean): LucideIcon {
  return !isPlaying || isPaused ? Play : Pause;
}

function startPauseLabel(isPlaying: boolean, isPaused: boolean): string {
  if (!isPlaying) return "게임 시작";
  if (isPaused) return "게임 재개";
  return "일시정지";
}

/**
 * 천혜향 / 천혜향 마스터 공통: 시작·리셋·음향·리더보드 버튼 줄
 */
export function GameControlToolbar({
  bgMusic,
  sfxSound,
  isPlaying,
  isPaused,
  onStart,
  onReset,
  onOpenLeaderboard,
}: GameControlToolbarProps) {
  const StartIcon = startPauseIcon(isPlaying, isPaused);
  const startLabel = startPauseLabel(isPlaying, isPaused);

  return (
    <div className="flex items-center justify-center gap-3">
      <motion.button
        type="button"
        className={BTN_PRIMARY}
        onClick={onStart}
        onKeyDown={(e) => handleKeyDown(e, onStart)}
        tabIndex={0}
        role="button"
        aria-label={startLabel}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <StartIcon className="h-4 w-4" />
        <span>{startLabel}</span>
      </motion.button>

      <motion.button
        type="button"
        className={BTN_MUTED}
        onClick={onReset}
        onKeyDown={(e) => handleKeyDown(e, onReset)}
        tabIndex={0}
        role="button"
        aria-label="게임 리셋"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <RotateCcw className="h-4 w-4" />
        <span>리셋</span>
      </motion.button>

      <motion.button
        type="button"
        className={BTN_MUTED}
        onClick={bgMusic.toggleMute}
        tabIndex={0}
        role="button"
        aria-label={bgMusic.isMuted ? "배경음 켜기" : "배경음 끄기"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {bgMusic.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        <span>{bgMusic.isMuted ? "배경음 켜기" : "배경음 끄기"}</span>
      </motion.button>

      <motion.button
        type="button"
        className={BTN_MUTED}
        onClick={sfxSound.toggleMute}
        tabIndex={0}
        role="button"
        aria-label={sfxSound.isMuted ? "효과음 켜기" : "효과음 끄기"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {sfxSound.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        <span>{sfxSound.isMuted ? "효과음 켜기" : "효과음 끄기"}</span>
      </motion.button>

      <motion.button
        type="button"
        className={BTN_MUTED}
        onClick={onOpenLeaderboard}
        onKeyDown={(e) => handleKeyDown(e, onOpenLeaderboard)}
        tabIndex={0}
        role="button"
        aria-label="리더보드 보기"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Trophy className="h-4 w-4" />
        <span>리더보드</span>
      </motion.button>
    </div>
  );
}
