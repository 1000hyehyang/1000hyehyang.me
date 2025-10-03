"use client";
import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTangerineMasterGame, useSyncHighScoreWithLocalStorage } from "@/lib/tangerine-master";
import { TangerineMasterCanvas } from "./TangerineMasterCanvas";
import { TangerineMasterControls, TangerineMasterControlsRef } from "./TangerineMasterControls";
import { TangerineMasterStats } from "./TangerineMasterStats";
import { RotateCcw } from "lucide-react";
import { GiscusComments } from "@/components/common/GiscusComments";
import { GISCUS_GAME_CONFIG } from "@/lib/config";
import { useOrientation, useGameOver, useGameAudio, useScoreSave } from "@/hooks/useGameCommon";

export const TangerineMasterGame = () => {
  const gameState = useTangerineMasterGame();
  const { highScore, updateHighScore } = useSyncHighScoreWithLocalStorage();
  const controlsRef = useRef<TangerineMasterControlsRef>(null);
  
  // 공통 훅 사용
  const isPortrait = useOrientation();
  const gameOverState = useGameOver();
  const { bgMusic, sfxSound } = useGameAudio(
    "/tangerine-master/tangerine-master-bgm.mp3",
    "/tangerine-master/fail.mp3"
  );
  const { saveScore } = useScoreSave(); // 게임 오버 시점의 원래 최고 기록

  // 게임 시작/일시정지/재개 처리
  const handleStartGame = () => {
    if (!gameState.isPlaying) {
      // 게임이 시작되지 않은 상태: 게임 시작
      gameState.startGame();
      
      if (!bgMusic.isMuted) {
        bgMusic.play();
      }
    } else if (gameState.isPaused) {
      // 일시정지 상태: 게임 재개
      gameState.resumeGame();
    } else {
      // 게임 중: 일시정지
      gameState.pauseGame();
    }
  };

  // 게임 오버 처리
  const handleGameOver = useCallback(() => {
    if (gameState.survivalTime > 0) {
      gameOverState.setShowGameOver(true);
      gameOverState.setOriginalHighScore(highScore); // 게임 오버 시점의 원래 최고 기록 저장
      updateHighScore(gameState.survivalTime);
      // 게임 오버 효과음 재생
      if (!sfxSound.isMuted) {
        sfxSound.play();
      }
    }
  }, [gameState.survivalTime, updateHighScore, sfxSound, highScore, gameOverState]);

  // 점수 저장
  const handleSaveScore = async () => {
    if (!gameOverState.playerName.trim()) {
      alert("플레이어명을 입력해주세요.");
      return;
    }

    const success = await saveScore(
      Math.floor(gameState.survivalTime),
      gameOverState.playerName,
      {
        isPlaying: gameState.isPlaying,
        survivalTime: gameState.survivalTime,
        player: gameState.player,
        tangerines: gameState.tangerines,
        difficulty: gameState.difficulty
      },
      '/api/tangerine-master',
      '/api/tangerine-master/session'
    );

    if (success) {
      alert("점수가 저장되었습니다!");
      gameOverState.setShowGameOver(false);
      gameState.resetGame();
    }
  };

  // 게임 오버 감지
  useEffect(() => {
    if (!gameState.isPlaying && gameState.survivalTime > 0 && !gameOverState.showGameOver) {
      handleGameOver();
    }
  }, [gameState.isPlaying, gameState.survivalTime, handleGameOver, gameOverState.showGameOver]);

  // 하이스코어 동기화
  useEffect(() => {
    gameState.setHighScore(highScore);
  }, [highScore, gameState]);

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
              귤림고수
            </h1>
            <p className="text-muted-foreground">
              화면을 가로로 돌려주세요
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              귤림고수는 가로 모드에서 더 편리하게 즐길 수 있어요.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• 세로 모드: 화면이 좁아서 게임하기 어려워요</p>
              <p>• 가로 모드: 넓은 화면으로 편리하게 게임할 수 있어요</p>
              <p>• 방향키로 캐릭터를 조작하는 게임이므로 가로 모드가 최적화되어 있어요</p>
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-xl font-semibold mb-2">
          귤림고수
        </h1>
      </motion.div>

      {/* 게임 통계 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <TangerineMasterStats
          survivalTime={gameState.survivalTime}
          highScore={highScore}
        />
      </motion.div>

      {/* 게임 컨트롤 */}
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

      {/* 게임 캔버스 */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TangerineMasterCanvas
          tangerines={gameState.tangerines}
          player={gameState.player}
          gameArea={gameState.gameArea}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
        />
      </motion.div>

      {/* 게임 오버 모달 */}
      <AnimatePresence>
        {gameOverState.showGameOver && (
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
                <p className="text-lg mb-2">생존 시간: <span className="font-semibold">
                  {Math.floor(gameState.survivalTime)}초
                </span></p>
              </div>

              <div className="space-y-4">
                {Math.floor(gameState.survivalTime) > gameOverState.originalHighScore && Math.floor(gameState.survivalTime) > 0 && (
                  <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-muted-foreground mb-2">
                      플레이어명
                    </label>
                    <input
                      id="playerName"
                      type="text"
                      value={gameOverState.playerName}
                      onChange={(e) => gameOverState.setPlayerName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/20 focus:bg-background"
                      maxLength={20}
                      onKeyDown={(e) => {
                        // WASD 키가 input 내부에서도 게임에 전달되도록 함
                        const gameKeys = ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
                        if (gameKeys.includes(e.key)) {
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  {Math.floor(gameState.survivalTime) > gameOverState.originalHighScore && Math.floor(gameState.survivalTime) > 0 && (
                    <button
                      onClick={handleSaveScore}
                      disabled={gameOverState.isSaving}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                        gameOverState.isSaving
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                    >
                      {gameOverState.isSaving ? '저장 중...' : '기록 저장'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      gameOverState.handleGameOverClose();
                      gameState.resetGame();
                    }}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
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
          <li>• 방향키 또는 WASD로 나낭이를 조작하세요</li>
          <li>• 날아오는 귤들을 피해서 최대한 오래 살아남으세요</li>
          <li>• 시간이 지날수록 귤의 개수와 속도가 증가합니다</li>
          <li>• 귤에 한 번이라도 맞으면 게임 오버입니다</li>
          <li>• 생존 시간이 기록으로 저장됩니다</li>
        </ul>
      </motion.div>

      {/* Giscus 댓글창 */}
      <GiscusComments
        repo={GISCUS_GAME_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_GAME_CONFIG.repoId}
        category={GISCUS_GAME_CONFIG.category}
        categoryId={GISCUS_GAME_CONFIG.categoryId}
        term="귤림고수"
      />
    </div>
  );
}; 