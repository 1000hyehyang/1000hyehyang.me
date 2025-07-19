"use client";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { useTangerineGameStore } from "@/lib/tangerine-game";
import { handleKeyDown } from "@/lib/utils";
import { useState } from "react";

interface GameControlsProps {
  bgMusic: {
    toggleMute: () => void;
    isMuted: boolean;
  };
  sfxSound: {
    toggleMute: () => void;
    isMuted: boolean;
  };
}

export const GameControls = ({ bgMusic, sfxSound }: GameControlsProps) => {
  const { 
    isPlaying, 
    isPaused, 
    startGame, 
    pauseGame, 
    resumeGame, 
    resetGame 
  } = useTangerineGameStore();

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStartClick = () => {
    if (!isPlaying) {
      startGame();
    } else if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const handleStartKeyDown = (event: React.KeyboardEvent) => {
    handleKeyDown(event, handleStartClick);
  };

  const handleResetClick = () => {
    resetGame();
  };

  const handleResetKeyDown = (event: React.KeyboardEvent) => {
    handleKeyDown(event, handleResetClick);
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
  };

  const handleLeaderboardKeyDown = (event: React.KeyboardEvent) => {
    handleKeyDown(event, handleLeaderboardClick);
  };

  const getButtonText = () => {
    if (!isPlaying) return "게임 시작";
    if (isPaused) return "게임 재개";
    return "일시정지";
  };

  const getButtonIcon = () => {
    if (!isPlaying) return Play;
    if (isPaused) return Play;
    return Pause;
  };

  const IconComponent = getButtonIcon();

  return (
    <>
      {/* 미니멀한 컨트롤 버튼들 */}
      <div className="flex gap-3 justify-center items-center">
        {/* 시작/일시정지 버튼 */}
        <motion.button
          className={`
            flex items-center gap-2 px-4 py-2 rounded text-sm font-medium
            transition-colors touch-manipulation cursor-pointer
            ${isPlaying && !isPaused
              ? 'bg-foreground text-background hover:bg-foreground/90' 
              : 'bg-foreground text-background hover:bg-foreground/90'
            }
          `}
          onClick={handleStartClick}
          onKeyDown={handleStartKeyDown}
          tabIndex={0}
          role="button"
          aria-label={getButtonText()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <IconComponent className="w-4 h-4" />
          <span>{getButtonText()}</span>
        </motion.button>

        {/* 리셋 버튼 */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors touch-manipulation cursor-pointer"
          onClick={handleResetClick}
          onKeyDown={handleResetKeyDown}
          tabIndex={0}
          role="button"
          aria-label="게임 리셋"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>리셋</span>
        </motion.button>

        {/* 음악 컨트롤 버튼 */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors touch-manipulation cursor-pointer"
          onClick={bgMusic.toggleMute}
          tabIndex={0}
          role="button"
          aria-label={bgMusic.isMuted ? "배경음 켜기" : "배경음 끄기"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {bgMusic.isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          <span>{bgMusic.isMuted ? "배경음 켜기" : "배경음 끄기"}</span>
        </motion.button>

        {/* 효과음 컨트롤 버튼 */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors touch-manipulation cursor-pointer"
          onClick={sfxSound.toggleMute}
          tabIndex={0}
          role="button"
          aria-label={sfxSound.isMuted ? "효과음 켜기" : "효과음 끄기"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {sfxSound.isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          <span>{sfxSound.isMuted ? "효과음 켜기" : "효과음 끄기"}</span>
        </motion.button>

        {/* 리더보드 버튼 */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors touch-manipulation cursor-pointer"
          onClick={handleLeaderboardClick}
          onKeyDown={handleLeaderboardKeyDown}
          tabIndex={0}
          role="button"
          aria-label="리더보드 보기"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trophy className="w-4 h-4" />
          <span>리더보드</span>
        </motion.button>
      </div>

      {/* 리더보드 모달 */}
      {showLeaderboard && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="bg-card border rounded-lg p-6 max-w-sm w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">리더보드</h2>
              <motion.button
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                onClick={() => setShowLeaderboard(false)}
                aria-label="닫기"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">✕</span>
              </motion.button>
            </div>
            
            <div className="text-center text-muted-foreground">
              <p className="text-sm">리더보드 기능은 곧 추가됩니다</p>
              <p className="text-xs mt-2">점수 저장 후 실시간 순위를 확인할 수 있어요</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}; 