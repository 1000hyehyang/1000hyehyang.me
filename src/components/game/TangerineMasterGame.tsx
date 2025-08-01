"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTangerineMasterGame, useSyncHighScoreWithLocalStorage } from "@/lib/tangerine-master";
import { useAudio } from "@/hooks/useAudio";
import { TangerineMasterCanvas } from "./TangerineMasterCanvas";
import { TangerineMasterControls, TangerineMasterControlsRef } from "./TangerineMasterControls";
import { TangerineMasterStats } from "./TangerineMasterStats";
import { GiscusComments } from "@/components/common/GiscusComments";
import { GISCUS_GAME_CONFIG } from "@/lib/config";

export const TangerineMasterGame = () => {
  const gameState = useTangerineMasterGame();
  const { highScore, updateHighScore } = useSyncHighScoreWithLocalStorage();
  const controlsRef = useRef<TangerineMasterControlsRef>(null);
  
  // 오디오 설정
  const bgMusic = useAudio({
    src: "/tangerine-master/tangerine-master-bgm.mp3",
    loop: true,
    volume: 0.3
  });

  const sfxSound = useAudio({
    src: "/tangerine-master/fail.mp3",
    loop: false,
    volume: 0.5
  });

  // 게임 오버 상태
  const [showGameOver, setShowGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
  const handleGameOver = () => {
    if (gameState.survivalTime > 0) {
      setShowGameOver(true);
      updateHighScore(gameState.survivalTime);
      // 게임 오버 효과음 재생
      if (!sfxSound.isMuted) {
        sfxSound.play();
      }
    }
  };

  // 게임 오버 모달 닫기
  const handleGameOverClose = () => {
    setShowGameOver(false);
    setPlayerName("");
    gameState.resetGame();
  };

  // 점수 저장
  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      alert("플레이어명을 입력해주세요.");
      return;
    }

    const currentScore = Math.floor(gameState.survivalTime);

    setIsSaving(true);
    try {
      const response = await fetch('/api/tangerine-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: currentScore,
          playerName: playerName.trim()
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("점수가 저장되었습니다!");
        setShowGameOver(false);
        gameState.resetGame();
      } else {
        alert(data.error || "점수 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error('점수 저장 실패:', error);
      alert("점수 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 게임 오버 감지
  useEffect(() => {
    if (!gameState.isPlaying && gameState.survivalTime > 0) {
      handleGameOver();
    }
  }, [gameState.isPlaying, gameState.survivalTime]);

  // 하이스코어 동기화
  useEffect(() => {
    gameState.setHighScore(highScore);
  }, [highScore]);

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
                <p className="text-lg mb-2">생존 시간: <span className="font-semibold">
                  {Math.floor(gameState.survivalTime)}초
                </span></p>
              </div>

              <div className="space-y-4">
                <div>
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
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSaveScore}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                      isSaving
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {isSaving ? '저장 중...' : '기록 저장'}
                  </button>
                  <button
                    onClick={handleGameOverClose}
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