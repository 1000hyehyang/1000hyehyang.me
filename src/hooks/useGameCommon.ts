import { useState, useEffect } from "react";
import { useAudio } from "./useAudio";

// 화면 방향 감지 훅
export const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(false);

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

  return isPortrait;
};

// 게임 오버 상태 관리 훅
export const useGameOver = () => {
  const [showGameOver, setShowGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [originalHighScore, setOriginalHighScore] = useState(0);

  const handleGameOverClose = () => {
    setShowGameOver(false);
    setPlayerName("");
    setHasSaved(false);
    setOriginalHighScore(0);
  };

  return {
    showGameOver,
    setShowGameOver,
    playerName,
    setPlayerName,
    isSaving,
    hasSaved,
    originalHighScore,
    setOriginalHighScore,
    handleGameOverClose
  };
};

// 게임 오디오 관리 훅
export const useGameAudio = (bgmSrc: string, sfxSrc: string) => {
  const bgMusic = useAudio({
    src: bgmSrc,
    loop: true,
    volume: 0.3
  });

  const sfxSound = useAudio({
    src: sfxSrc,
    loop: false,
    volume: 0.5
  });

  return { bgMusic, sfxSound };
};

// 점수 저장 로직 훅
export const useScoreSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const saveScore = async (
    score: number,
    playerName: string,
    gameState: Record<string, unknown>,
    apiEndpoint: string,
    sessionEndpoint: string
  ) => {
    if (isSaving || hasSaved) return;

    setIsSaving(true);
    try {
      // 점수 저장 시에만 세션 생성
      const sessionId = `game_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 세션 토큰을 서버에 저장
      await fetch(sessionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          playerName: playerName || `Player_${Math.random().toString(36).substr(2, 4)}`,
          gameSessionId: sessionId,
          gameState
        }),
      });

      if (response.ok) {
        setHasSaved(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error('점수 저장 실패:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('점수 저장 중 오류:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, hasSaved, saveScore };
};
