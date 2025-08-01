import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export interface Tangerine {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Player {
  x: number;
  y: number;
  size: number;
  health: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  survivalTime: number;
  highScore: number;
  tangerines: Tangerine[];
  player: Player;
  gameArea: {
    width: number;
    height: number;
  };
  difficulty: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  updateGame: () => void;
  updateHighScore: (score: number) => void;
  setHighScore: (score: number) => void;
}

const GAME_AREA_WIDTH = 800;
const GAME_AREA_HEIGHT = 600;
const PLAYER_SIZE = 30;
const BASE_TANGERINE_SIZE = 20;
const BASE_SPAWN_RATE = 1000; // 1초마다
const BASE_SPEED = 2;

const generateTangerine = (gameArea: { width: number; height: number }, difficulty: number): Tangerine => {
  const side = Math.floor(Math.random() * 4);
  let x = 0, y = 0, vx = 0, vy = 0;
  
  const speed = BASE_SPEED + (difficulty * 1.2); // 속도 증가
  const size = BASE_TANGERINE_SIZE - (difficulty * 1);
  
  switch (side) {
    case 0: // top
      x = Math.random() * gameArea.width;
      y = -50;
      vx = (Math.random() - 0.5) * speed;
      vy = speed;
      break;
    case 1: // right
      x = gameArea.width + 50;
      y = Math.random() * gameArea.height;
      vx = -speed;
      vy = (Math.random() - 0.5) * speed;
      break;
    case 2: // bottom
      x = Math.random() * gameArea.width;
      y = gameArea.height + 50;
      vx = (Math.random() - 0.5) * speed;
      vy = -speed;
      break;
    case 3: // left
      x = -50;
      y = Math.random() * gameArea.height;
      vx = speed;
      vy = (Math.random() - 0.5) * speed;
      break;
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    vx,
    vy,
    size: Math.max(size, 15),
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10
  };
};

const checkCollision = (player: Player, tangerine: Tangerine): boolean => {
  const dx = player.x - tangerine.x;
  const dy = player.y - tangerine.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (player.size + tangerine.size) / 2;
  return distance < minDistance;
};

export function useTangerineMasterGame(): GameState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [tangerines, setTangerines] = useState<Tangerine[]>([]);
  const [player, setPlayer] = useState<Player>({
    x: GAME_AREA_WIDTH / 2,
    y: GAME_AREA_HEIGHT / 2,
    size: PLAYER_SIZE,
    health: 1
  });
  const [difficulty, setDifficulty] = useState(0);
  
  const gameArea = useMemo(() => ({ 
    width: GAME_AREA_WIDTH, 
    height: GAME_AREA_HEIGHT 
  }), []);
  const lastSpawnTime = useRef(0);
  const lastUpdateTime = useRef(0);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    setSurvivalTime(0);
    setTangerines([]);
    setPlayer({
      x: GAME_AREA_WIDTH / 2,
      y: GAME_AREA_HEIGHT / 2,
      size: PLAYER_SIZE,
      health: 1
    });
    setDifficulty(0);
    lastSpawnTime.current = 0;
    lastUpdateTime.current = Date.now();
  }, []);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    lastUpdateTime.current = Date.now();
  }, []);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    if (survivalTime > highScore) {
      setHighScore(survivalTime);
    }
  }, [survivalTime, highScore]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setSurvivalTime(0);
    setTangerines([]);
    setPlayer({
      x: GAME_AREA_WIDTH / 2,
      y: GAME_AREA_HEIGHT / 2,
      size: PLAYER_SIZE,
      health: 1
    });
    setDifficulty(0);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlaying || isPaused) return;
    
    setPlayer(prev => {
      const newX = Math.max(prev.size / 2, Math.min(gameArea.width - prev.size / 2, prev.x + dx));
      const newY = Math.max(prev.size / 2, Math.min(gameArea.height - prev.size / 2, prev.y + dy));
      return { ...prev, x: newX, y: newY };
    });
  }, [isPlaying, isPaused, gameArea.width, gameArea.height]);

  const updateGame = useCallback(() => {
    if (!isPlaying || isPaused) return;

    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    // 시간 업데이트
    setSurvivalTime(prev => {
      const newTime = prev + deltaTime / 1000;
      // 난이도 업데이트 (5초마다 증가)
      setDifficulty(Math.floor(newTime / 5));
      return newTime;
    });

    // 귤 생성 (난이도에 따라 점점 더 많이 생성)
    const spawnRate = Math.max(BASE_SPAWN_RATE - (difficulty * 100), 200);
    if (now - lastSpawnTime.current > spawnRate) {
      const spawnCount = 3 + Math.floor(difficulty / 2); // 기본 3개부터 시작, 난이도에 따라 무제한 증가
      const newTangerines: Tangerine[] = [];
      for (let i = 0; i < spawnCount; i++) {
        newTangerines.push(generateTangerine(gameArea, difficulty));
      }
      setTangerines(prev => [...prev, ...newTangerines]);
      lastSpawnTime.current = now;
    }

    // 귤 이동 및 충돌 검사
    setTangerines(prev => {
      const updated = prev
        .map(tangerine => ({
          ...tangerine,
          x: tangerine.x + tangerine.vx,
          y: tangerine.y + tangerine.vy,
          rotation: tangerine.rotation + tangerine.rotationSpeed
        }))
        .filter(tangerine => 
          tangerine.x > -100 && 
          tangerine.x < gameArea.width + 100 && 
          tangerine.y > -100 && 
          tangerine.y < gameArea.height + 100
        );

      // 충돌 검사
      updated.forEach(tangerine => {
        if (checkCollision(player, tangerine)) {
          endGame();
        }
      });

      return updated;
    });
  }, [isPlaying, isPaused, difficulty, gameArea, player, endGame]);

  const updateHighScore = useCallback((score: number) => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [highScore]);

  const setHighScoreFromStorage = useCallback((score: number) => {
    setHighScore(score);
  }, []);

  // 게임 루프
  useEffect(() => {
    let animationId: number;

    const gameLoop = () => {
      if (isPlaying && !isPaused) {
        updateGame();
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    if (isPlaying && !isPaused) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, isPaused, updateGame]);

  // 키보드 이벤트 (부드러운 대각선 이동 지원)
  useEffect(() => {
    const pressedKeys = new Set<string>();
    const moveSpeed = 4; // 이동 속도 줄임

    const handleKeyDown = (event: KeyboardEvent) => {
      // 게임 관련 키들에 대해 기본 동작 방지
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (gameKeys.includes(event.key)) {
        event.preventDefault();
      }

      // 게임이 진행 중이고 일시정지가 아닐 때만 이동 키 처리
      // 게임 오버 상태에서도 키 입력을 처리하되, 실제 이동은 게임이 진행 중일 때만
      if (isPlaying && !isPaused) {
        pressedKeys.add(event.key);
      } else {
        // 게임 오버 상태에서도 키 입력을 기록 (다시 게임 시작할 때를 위해)
        pressedKeys.add(event.key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key);
    };

    // 부드러운 이동을 위한 게임 루프
    const moveLoop = () => {
      if (isPlaying && !isPaused) {
        let dx = 0;
        let dy = 0;

        if (pressedKeys.has('ArrowUp') || pressedKeys.has('w') || pressedKeys.has('W')) {
          dy -= moveSpeed;
        }
        if (pressedKeys.has('ArrowDown') || pressedKeys.has('s') || pressedKeys.has('S')) {
          dy += moveSpeed;
        }
        if (pressedKeys.has('ArrowLeft') || pressedKeys.has('a') || pressedKeys.has('A')) {
          dx -= moveSpeed;
        }
        if (pressedKeys.has('ArrowRight') || pressedKeys.has('d') || pressedKeys.has('D')) {
          dx += moveSpeed;
        }

        // 대각선 이동 시 속도 정규화
        if (dx !== 0 && dy !== 0) {
          const diagonalSpeed = moveSpeed / Math.sqrt(2);
          dx = dx > 0 ? diagonalSpeed : -diagonalSpeed;
          dy = dy > 0 ? diagonalSpeed : -diagonalSpeed;
        }

        if (dx !== 0 || dy !== 0) {
          movePlayer(dx, dy);
        }
      }
    };

    // 부드러운 이동을 위한 requestAnimationFrame
    let animationId: number;
    const smoothMoveLoop = () => {
      moveLoop();
      animationId = requestAnimationFrame(smoothMoveLoop);
    };

    if (isPlaying && !isPaused) {
      smoothMoveLoop();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, isPaused, movePlayer]);

  return {
    isPlaying,
    isPaused,
    survivalTime,
    highScore,
    tangerines,
    player,
    gameArea,
    difficulty,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    movePlayer,
    updateGame,
    updateHighScore,
    setHighScore: setHighScoreFromStorage
  };
}

export function useSyncHighScoreWithLocalStorage() {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('tangerine_master_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const updateHighScore = useCallback((score: number) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tangerine_master_high_score', score.toString());
    }
  }, [highScore]);

  return { highScore, updateHighScore };
} 