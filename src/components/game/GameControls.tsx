"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { useTangerineGameStore } from "@/lib/tangerine-game";
import { handleKeyDown } from "@/lib/utils";
import { useState, forwardRef, useImperativeHandle } from "react";

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

export interface GameControlsRef {
  refreshLeaderboard: () => void;
}

interface LeaderboardEntry {
  score: number;
  timestamp: string;
  playerName?: string;
}

interface LeaderboardData {
  scores: LeaderboardEntry[];
  lastUpdated: string;
}

export const GameControls = forwardRef<GameControlsRef, GameControlsProps>(({ bgMusic, sfxSound }, ref) => {
  const { 
    isPlaying, 
    isPaused, 
    startGame, 
    pauseGame, 
    resumeGame, 
    resetGame 
  } = useTangerineGameStore();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tangerine-game');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard);
      }
    } catch (error) {
      console.error('리더보드 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchLeaderboard();
  };

  const handleLeaderboardKeyDown = (event: React.KeyboardEvent) => {
    handleKeyDown(event, handleLeaderboardClick);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // XSS 방지를 위한 안전한 텍스트 렌더링
  const safeText = (text: string): string => {
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
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

  useImperativeHandle(ref, () => ({
    refreshLeaderboard: fetchLeaderboard,
  }));

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
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-card border rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">🏆 명예의 전당</h2>
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
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">리더보드 불러오는 중...</p>
                </div>
              ) : leaderboardData && leaderboardData.scores.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.scores.map((entry, index) => (
                    <motion.div
                      key={`${entry.playerName}-${entry.timestamp}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''} {safeText(entry.playerName || '익명')}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-foreground">{entry.score}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 기록이 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-2">첫 번째 기록을 만들어보세요!</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button
                  onClick={fetchLeaderboard}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? '새로고침 중...' : '새로고침'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

GameControls.displayName = 'GameControls'; 