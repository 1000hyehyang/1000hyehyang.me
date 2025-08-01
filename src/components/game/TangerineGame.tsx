"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTangerineGameStore, type Tangerine, useSyncHighScoreWithLocalStorage } from "@/lib/tangerine-game";
import { TangerineGrid } from "./TangerineGrid";
import { GameControls, type GameControlsRef } from "./GameControls";
import { GameStats } from "./GameStats";
import { RotateCcw } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { GiscusComments } from "@/components/common/GiscusComments";
import { GISCUS_GAME_CONFIG } from "@/lib/config";

export const TangerineGame = () => {
  useSyncHighScoreWithLocalStorage();
  const { 
    isPlaying, 
    isPaused, 
    score, 
    timeLeft, 
    selectTangerine, 
    updateTime,
    endGame: endGameFromStore,
    generateNewGrid,
    highScore
  } = useTangerineGameStore();

  const [showGameOver, setShowGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [originalHighScore, setOriginalHighScore] = useState(0); // 게임 오버 시점의 원래 최고 기록

  const gameControlsRef = useRef<GameControlsRef>(null);

  // 배경 음악 관리
  const bgMusic = useAudio({
    src: "/orange-game/orange-game-bgm.mp3",
    loop: true,
    volume: 0.3
  });

  // 효과음 관리
  const sfxSound = useAudio({
    src: "/orange-game/success.mp3",
    loop: false,
    volume: 0.5
  });

  // 화면 방향 감지
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // 타이머 효과
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

  // 초기 격자 생성 (클라이언트 사이드에서만)
  useEffect(() => {
    generateNewGrid();
  }, [generateNewGrid]);

  // 게임 종료 처리
  useEffect(() => {
    if (timeLeft <= 0) {
      endGameFromStore();
      setOriginalHighScore(highScore); // 게임 오버 시점의 원래 최고 기록 저장
      setShowGameOver(true);
    }
  }, [timeLeft, endGameFromStore, highScore]);

  // 게임 시작 시 배경음악 재생
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

  const handleGameOverClose = () => {
    setShowGameOver(false);
    setPlayerName("");
    setHasSaved(false);
    setOriginalHighScore(0); // 원래 최고 기록 초기화
  };

  const handleSaveScore = async () => {
    if (isSaving || hasSaved) return;
    
    // 클라이언트 측 점수 검증
    if (!Number.isInteger(score) || score < 0 || score > 50000) {
      console.error('유효하지 않은 점수입니다.');
      return;
    }

    // 플레이어명 정제
    const sanitizedPlayerName = playerName
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .slice(0, 20);

    setIsSaving(true);
    try {
      // 점수 저장 시에만 세션 생성
      const sessionId = `game_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 세션 토큰을 서버에 저장
      await fetch('/api/tangerine-game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const response = await fetch('/api/tangerine-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          playerName: sanitizedPlayerName || `Player_${Math.random().toString(36).substr(2, 4)}`,
          gameSessionId: sessionId,
          gameState: {
            isPlaying,
            score,
            timeLeft,
            tangerines: useTangerineGameStore.getState().tangerines
          }
        }),
      });

      if (response.ok) {
        setHasSaved(true);
        // 점수 저장 성공 시 리더보드 새로고침
        if (gameControlsRef.current) {
          gameControlsRef.current.refreshLeaderboard();
        }
        // 1초 후 모달창 닫기
        setTimeout(() => {
          handleGameOverClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('점수 저장 실패:', errorData.error);
      }
    } catch (error) {
      console.error('점수 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 세로 모드일 때 가로 모드 안내
  if (isPortrait) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 bg-foreground rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <RotateCcw className="w-8 h-8 text-background" />
            </motion.div>
            <h1 className="text-2xl font-semibold mb-2">
              천혜향 게임
            </h1>
            <p className="text-muted-foreground">
              화면을 가로로 돌려주세요
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              천혜향 게임은 가로 모드에서 더 편리하게 즐길 수 있어요.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• 세로 모드: 화면이 좁아서 게임하기 어려워요</p>
              <p>• 가로 모드: 넓은 화면으로 편리하게 게임할 수 있어요</p>
              <p>• 10x20 격자 게임이므로 가로 모드가 최적화되어 있어요</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 게임 제목 */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-xl font-semibold mb-2">
          천혜향 게임
        </h1>
      </motion.div>

      {/* 게임 통계 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <GameStats />
      </motion.div>

      {/* 게임 컨트롤 */}
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
            isMuted: bgMusic.isMuted
          }} 
          sfxSound={{
            toggleMute: sfxSound.toggleMute,
            isMuted: sfxSound.isMuted
          }} 
        />
      </motion.div>

      {/* 게임 보드 */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TangerineGrid onTangerineClick={handleTangerineClick} />
      </motion.div>

      {/* 게임 오버 모달 */}
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-card border rounded-lg p-6 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-center mb-4">
                게임 종료
              </h2>
              <div className="text-center mb-6">
                <p className="text-lg mb-2">최종 점수: <span className="font-semibold">{score}</span></p>
              </div>

              {/* 플레이어명 입력 */}
              {score > originalHighScore && score > 0 && (
                <div className="mb-6">
                  <label htmlFor="playerName" className="block text-sm font-medium text-muted-foreground mb-2">
                    플레이어명
                  </label>
                  <input
                    id="playerName"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/20 focus:bg-background"
                    maxLength={20}
                  />
                </div>
              )}
                          
              <div className="flex gap-3 justify-center">
                {score > originalHighScore && score > 0 && (
                  <button
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                      isSaving || hasSaved
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                    onClick={handleSaveScore}
                    disabled={isSaving || hasSaved}
                  >
                    {isSaving ? '저장 중...' : hasSaved ? '저장 완료' : '점수 저장'}
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors cursor-pointer"
                  onClick={handleGameOverClose}
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 게임 설명 */}
      <motion.div
        className="mt-8 p-6 bg-muted/50 rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-3">
          게임 방법
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 연속된 천혜향을 클릭하여 선택하세요 (가로, 세로)</li>
          <li>• 선택된 천혜향들의 합이 10이 되면 점수를 획득합니다</li>
          <li>• 1분 안에 최대한 높은 점수를 얻으세요</li>
          <li>• 합이 10을 초과하면 선택이 초기화됩니다</li>
          <li>• 연속되지 않은 천혜향은 선택할 수 없습니다</li>
        </ul>
      </motion.div>

      {/* Giscus 댓글창 */}
      <GiscusComments
        repo={GISCUS_GAME_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_GAME_CONFIG.repoId}
        category={GISCUS_GAME_CONFIG.category}
        categoryId={GISCUS_GAME_CONFIG.categoryId}
        term="천혜향 게임"
      />
    </div>
  );
}; 