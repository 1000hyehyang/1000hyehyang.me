import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { safeLocalStorage } from './utils';

export interface Tangerine {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  kind: "normal" | "hit-wave";
}

export interface SpawnWarning {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  createdAt: number;
  spawnAt: number;
  kind: "normal" | "hit-wave";
}

export interface HitWaveState {
  startedAt: number;
  endsAt: number;
  ringRadius: number;
  centerX: number;
  centerY: number;
}

interface TangerineSpawnPlan {
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
  spawnWarnings: SpawnWarning[];
  hitWave: HitWaveState | null;
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
  setHighScore: (score: number) => void;
}

const GAME_AREA_WIDTH = 800;
const GAME_AREA_HEIGHT = 600;
const PLAYER_SIZE = 30;
const BASE_TANGERINE_SIZE = 20;
const BASE_SPEED = 2;
const SPAWN_MARGIN = 40;
const BASE_SPAWN_WARNING_MS = 750;
const LASER_STAGGER_MS = 150;
/** 히트 웨이브 등장 시각(초). 이후 웨이브는 마지막 간격(35초)으로 반복 */
const HIT_WAVE_SCHEDULE_SEC = [15, 35, 70] as const;
const HIT_WAVE_REPEAT_INTERVAL_SEC = 35;
const HIT_WAVE_WARNING_MS = 3000;
const HIT_WAVE_RING_COUNT = 52;
const HIT_WAVE_RING_LAYERS_BASE = 2;
const HIT_WAVE_STAGGER_MS = 12;
const HIT_WAVE_COOLDOWN_MS = 2000;
const HIT_WAVE_MIN_WARNING_MS = 2200;
const HIT_WAVE_MAX_RING_COUNT = 80;
const HIT_WAVE_MAX_RING_LAYERS = 5;
const HIT_WAVE_MIN_STAGGER_MS = 6;
const HIT_WAVE_LAYER_RADIUS_STEP = 0.07;

type HitWaveScaling = {
  ringCount: number;
  ringLayers: number;
  warningMs: number;
  speedBonus: number;
  staggerMs: number;
  sizeOffset: number;
};

/** 히트 웨이브 회차·난이도에 따라 점점 어려워짐 (양 증가 + 속도 소폭 상승) */
const getHitWaveScaling = (
  hitWaveIndex: number,
  difficulty: number
): HitWaveScaling => {
  const tier = hitWaveIndex + Math.floor(difficulty / 4);

  return {
    ringCount: Math.min(HIT_WAVE_RING_COUNT + tier * 6, HIT_WAVE_MAX_RING_COUNT),
    ringLayers: Math.min(
      HIT_WAVE_RING_LAYERS_BASE + Math.floor(tier / 2),
      HIT_WAVE_MAX_RING_LAYERS
    ),
    warningMs: Math.max(
      HIT_WAVE_MIN_WARNING_MS,
      HIT_WAVE_WARNING_MS - tier * 120
    ),
    speedBonus: tier * 0.16,
    staggerMs: Math.max(HIT_WAVE_MIN_STAGGER_MS, HIT_WAVE_STAGGER_MS - tier),
    sizeOffset: Math.min(Math.floor(tier / 2), 4),
  };
};

const getHitWaveTimeSec = (index: number): number => {
  if (index < HIT_WAVE_SCHEDULE_SEC.length) {
    return HIT_WAVE_SCHEDULE_SEC[index];
  }

  const lastScheduled = HIT_WAVE_SCHEDULE_SEC[HIT_WAVE_SCHEDULE_SEC.length - 1];
  const extraCount = index - HIT_WAVE_SCHEDULE_SEC.length + 1;
  return lastScheduled + HIT_WAVE_REPEAT_INTERVAL_SEC * extraCount;
};

const getHitWaveIndex = (survivalSec: number): number => {
  if (survivalSec < HIT_WAVE_SCHEDULE_SEC[0]) return -1;

  let index = 0;
  while (getHitWaveTimeSec(index + 1) <= survivalSec) {
    index++;
  }
  return index;
};

const getSpawnWarningDuration = (difficulty: number) =>
  Math.max(400, BASE_SPAWN_WARNING_MS - difficulty * 35);

/** 웨이브 간격 — 시간이 지날수록 빽빽해짐 */
const getWaveInterval = (difficulty: number) =>
  Math.max(320, 1500 - difficulty * 100);

/** 웨이브당 레이저 수 — 초반 1~2개, 점차 증가 */
const getLasersPerWave = (difficulty: number): number => {
  if (difficulty <= 1) {
    return Math.random() < 0.5 ? 1 : 2;
  }
  if (difficulty <= 5) {
    return 2 + Math.floor(difficulty / 3);
  }
  return Math.min(4 + Math.floor(difficulty / 3), 10);
};

/** 화면 밖 스폰 → 플레이 영역 안 목표점으로 정규화된 속도 벡터 */
const planLaserSpawn = (
  gameArea: { width: number; height: number },
  difficulty: number
): TangerineSpawnPlan => {
  const speed = BASE_SPEED + difficulty * 0.85;
  const size = Math.max(BASE_TANGERINE_SIZE - difficulty, 15);
  const side = Math.floor(Math.random() * 4);

  const targetX =
    SPAWN_MARGIN + Math.random() * (gameArea.width - SPAWN_MARGIN * 2);
  const targetY =
    SPAWN_MARGIN + Math.random() * (gameArea.height - SPAWN_MARGIN * 2);

  let x = 0;
  let y = 0;

  switch (side) {
    case 0:
      x = Math.random() * gameArea.width;
      y = -SPAWN_MARGIN;
      break;
    case 1:
      x = gameArea.width + SPAWN_MARGIN;
      y = Math.random() * gameArea.height;
      break;
    case 2:
      x = Math.random() * gameArea.width;
      y = gameArea.height + SPAWN_MARGIN;
      break;
    default:
      x = -SPAWN_MARGIN;
      y = Math.random() * gameArea.height;
      break;
  }

  const dx = targetX - x;
  const dy = targetY - y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x,
    y,
    vx: (dx / length) * speed,
    vy: (dy / length) * speed,
    size,
    rotation: Math.atan2(dy, dx) * (180 / Math.PI),
    rotationSpeed: (Math.random() - 0.5) * 6,
  };
};

/** 히트 웨이브 — 사방에서 원형으로 수렴 */
const planHitWaveRing = (
  gameArea: { width: number; height: number },
  difficulty: number,
  scaling: HitWaveScaling
): {
  plans: TangerineSpawnPlan[];
  ringRadius: number;
  centerX: number;
  centerY: number;
} => {
  const centerX = gameArea.width / 2;
  const centerY = gameArea.height / 2;
  const ringRadius =
    Math.hypot(gameArea.width, gameArea.height) / 2 + SPAWN_MARGIN;
  const speed = BASE_SPEED + difficulty * 0.35 + 0.9 + scaling.speedBonus;
  const size = Math.max(
    BASE_TANGERINE_SIZE - difficulty + 2 - scaling.sizeOffset,
    15
  );

  const plans: TangerineSpawnPlan[] = [];
  const angleOffsetPerLayer = (Math.PI * 2) / scaling.ringCount / 2;

  for (let layer = 0; layer < scaling.ringLayers; layer++) {
    const layerRadius = ringRadius * (1 - layer * HIT_WAVE_LAYER_RADIUS_STEP);
    const layerAngleOffset = layer * angleOffsetPerLayer;

    for (let i = 0; i < scaling.ringCount; i++) {
      const angle =
        (i / scaling.ringCount) * Math.PI * 2 - Math.PI / 2 + layerAngleOffset;

      const x = centerX + Math.cos(angle) * layerRadius;
      const y = centerY + Math.sin(angle) * layerRadius;
      const dx = centerX - x;
      const dy = centerY - y;
      const length = Math.hypot(dx, dy) || 1;

      plans.push({
        x,
        y,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
        size,
        rotation: Math.atan2(dy, dx) * (180 / Math.PI),
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    }
  }

  return {
    plans,
    ringRadius,
    centerX,
    centerY,
  };
};

const createTangerineFromPlan = (
  plan: TangerineSpawnPlan,
  kind: Tangerine["kind"] = "normal"
): Tangerine => ({
  id: Math.random().toString(36).slice(2, 11),
  ...plan,
  kind,
});

const warningToPlan = (warning: SpawnWarning): TangerineSpawnPlan => ({
  x: warning.x,
  y: warning.y,
  vx: warning.vx,
  vy: warning.vy,
  size: warning.size,
  rotation: warning.rotation,
  rotationSpeed: warning.rotationSpeed,
});

const createSpawnWarning = (
  plan: TangerineSpawnPlan,
  createdAt: number,
  difficulty: number,
  options?: {
    kind?: SpawnWarning["kind"];
    spawnAt?: number;
    warningMs?: number;
  }
): SpawnWarning => ({
  id: Math.random().toString(36).slice(2, 11),
  x: plan.x,
  y: plan.y,
  vx: plan.vx,
  vy: plan.vy,
  size: plan.size,
  rotation: plan.rotation,
  rotationSpeed: plan.rotationSpeed,
  kind: options?.kind ?? "normal",
  createdAt,
  spawnAt:
    options?.spawnAt ??
    createdAt + (options?.warningMs ?? getSpawnWarningDuration(difficulty)),
});

const createHitWaveWave = (
  gameArea: { width: number; height: number },
  difficulty: number,
  hitWaveIndex: number,
  now: number
): { warnings: SpawnWarning[]; state: HitWaveState } => {
  const scaling = getHitWaveScaling(hitWaveIndex, difficulty);
  const { plans, ringRadius, centerX, centerY } = planHitWaveRing(
    gameArea,
    difficulty,
    scaling
  );

  const warnings = plans.map((plan, index) =>
    createSpawnWarning(plan, now, difficulty, {
      kind: "hit-wave",
      warningMs: scaling.warningMs,
      spawnAt: now + scaling.warningMs + index * scaling.staggerMs,
    })
  );

  return {
    warnings,
    state: {
      startedAt: now,
      endsAt: now + scaling.warningMs,
      ringRadius,
      centerX,
      centerY,
    },
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
  const [spawnWarnings, setSpawnWarnings] = useState<SpawnWarning[]>([]);
  const [hitWave, setHitWave] = useState<HitWaveState | null>(null);
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
  const survivalTimeRef = useRef(0);
  const hitWavesTriggeredRef = useRef<Set<number>>(new Set());
  const hitWaveCooldownUntilRef = useRef(0);
  const spawnWarningsRef = useRef<SpawnWarning[]>([]);
  const hitWaveRef = useRef<HitWaveState | null>(null);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const playerRef = useRef(player);
  const lastDisplayedSecondRef = useRef(-1);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    spawnWarningsRef.current = spawnWarnings;
  }, [spawnWarnings]);

  useEffect(() => {
    hitWaveRef.current = hitWave;
  }, [hitWave]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    setSurvivalTime(0);
    setTangerines([]);
    setSpawnWarnings([]);
    setHitWave(null);
    setPlayer({
      x: GAME_AREA_WIDTH / 2,
      y: GAME_AREA_HEIGHT / 2,
      size: PLAYER_SIZE,
      health: 1
    });
    setDifficulty(0);
    survivalTimeRef.current = 0;
    lastDisplayedSecondRef.current = -1;
    hitWavesTriggeredRef.current.clear();
    hitWaveCooldownUntilRef.current = 0;
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
    if (!isPlayingRef.current) return;

    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);

    const finalTime = survivalTimeRef.current;
    setSurvivalTime(finalTime);
    if (finalTime > highScore) {
      setHighScore(finalTime);
    }
  }, [highScore]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setSurvivalTime(0);
    setTangerines([]);
    setSpawnWarnings([]);
    setHitWave(null);
    setPlayer({
      x: GAME_AREA_WIDTH / 2,
      y: GAME_AREA_HEIGHT / 2,
      size: PLAYER_SIZE,
      health: 1
    });
    setDifficulty(0);
    survivalTimeRef.current = 0;
    lastDisplayedSecondRef.current = -1;
    hitWavesTriggeredRef.current.clear();
    hitWaveCooldownUntilRef.current = 0;
    lastSpawnTime.current = 0;
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlayingRef.current || isPausedRef.current) return;
    
    setPlayer(prev => {
      const newX = Math.max(prev.size / 2, Math.min(gameArea.width - prev.size / 2, prev.x + dx));
      const newY = Math.max(prev.size / 2, Math.min(gameArea.height - prev.size / 2, prev.y + dy));
      const next = { ...prev, x: newX, y: newY };
      playerRef.current = next;
      return next;
    });
  }, [gameArea.width, gameArea.height]);

  const updateGame = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current) return;

    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    const newSurvivalTime = survivalTimeRef.current + deltaTime / 1000;
    survivalTimeRef.current = newSurvivalTime;
    const activeDifficulty = Math.floor(newSurvivalTime / 5);

    const displayedSecond = Math.floor(newSurvivalTime);
    if (displayedSecond !== lastDisplayedSecondRef.current) {
      lastDisplayedSecondRef.current = displayedSecond;
      setSurvivalTime(newSurvivalTime);
      setDifficulty(activeDifficulty);
    }

    if (hitWaveRef.current && now >= hitWaveRef.current.endsAt) {
      setHitWave(null);
    }

    const pendingSpawns: Tangerine[] = [];
    const remainingWarnings = spawnWarningsRef.current.filter((warning) => {
      if (now >= warning.spawnAt) {
        pendingSpawns.push(
          createTangerineFromPlan(warningToPlan(warning), warning.kind)
        );
        return false;
      }
      return true;
    });

    const scheduledWarnings: SpawnWarning[] = [];
    let nextHitWave = hitWaveRef.current;

    const hitWaveIndex = getHitWaveIndex(newSurvivalTime);
    if (hitWaveIndex >= 0 && !hitWavesTriggeredRef.current.has(hitWaveIndex)) {
      hitWavesTriggeredRef.current.add(hitWaveIndex);
      const hitWaveWave = createHitWaveWave(
        gameArea,
        activeDifficulty,
        hitWaveIndex,
        now
      );
      scheduledWarnings.push(...hitWaveWave.warnings);
      nextHitWave = hitWaveWave.state;
      setHitWave(nextHitWave);
      hitWaveCooldownUntilRef.current =
        hitWaveWave.state.endsAt + HIT_WAVE_COOLDOWN_MS;
      lastSpawnTime.current = now;
    }

    const inHitWavePhase =
      (nextHitWave !== null && now < nextHitWave.endsAt) ||
      now < hitWaveCooldownUntilRef.current;

    if (!inHitWavePhase) {
      const waveInterval = getWaveInterval(activeDifficulty);
      if (now - lastSpawnTime.current > waveInterval) {
        const laserCount = getLasersPerWave(activeDifficulty);
        for (let i = 0; i < laserCount; i++) {
          const waveOffset = i * LASER_STAGGER_MS;
          scheduledWarnings.push(
            createSpawnWarning(
              planLaserSpawn(gameArea, activeDifficulty),
              now + waveOffset,
              activeDifficulty
            )
          );
        }
        lastSpawnTime.current = now;
      }
    }

    const nextWarnings = [...remainingWarnings, ...scheduledWarnings];

    if (
      nextWarnings.length !== spawnWarningsRef.current.length ||
      pendingSpawns.length > 0
    ) {
      setSpawnWarnings(nextWarnings);
    }

    setTangerines((prev) => {
      const withSpawns =
        pendingSpawns.length > 0 ? [...prev, ...pendingSpawns] : prev;

      const updated = withSpawns
        .map((tangerine) => ({
          ...tangerine,
          x: tangerine.x + tangerine.vx,
          y: tangerine.y + tangerine.vy,
          rotation: tangerine.rotation + tangerine.rotationSpeed,
        }))
        .filter(
          (tangerine) =>
            tangerine.x > -100 &&
            tangerine.x < gameArea.width + 100 &&
            tangerine.y > -100 &&
            tangerine.y < gameArea.height + 100
        );

      updated.forEach((tangerine) => {
        if (checkCollision(playerRef.current, tangerine)) {
          endGame();
        }
      });

      return updated;
    });
  }, [gameArea, endGame]);

  const setHighScoreFromStorage = useCallback((score: number) => {
    setHighScore(score);
  }, []);

  // 게임 루프
  useEffect(() => {
    let animationId: number;

    const gameLoop = () => {
      if (isPlayingRef.current && !isPausedRef.current) {
        updateGame();
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    if (isPlayingRef.current && !isPausedRef.current) {
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
    const moveSpeed = 4;

    const handleKeyDown = (event: KeyboardEvent) => {
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (gameKeys.includes(event.key)) {
        event.preventDefault();
      }

      if (isPlayingRef.current && !isPausedRef.current) {
        pressedKeys.add(event.key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key);
    };

    const moveLoop = () => {
      if (isPlayingRef.current && !isPausedRef.current) {
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

    let animationId: number;
    const smoothMoveLoop = () => {
      moveLoop();
      animationId = requestAnimationFrame(smoothMoveLoop);
    };

    if (isPlayingRef.current && !isPausedRef.current) {
      smoothMoveLoop();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      pressedKeys.clear();
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
    spawnWarnings,
    hitWave,
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
    setHighScore: setHighScoreFromStorage
  };
}

export function useSyncHighScoreWithLocalStorage() {
  const [highScore, setHighScore] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = safeLocalStorage.getNumber('tangerine_master_high_score');
    if (saved > 0) {
      setHighScore(saved);
    }
    setIsReady(true);
  }, []);

  const updateHighScore = useCallback((score: number) => {
    const flooredScore = Math.floor(score);
    if (flooredScore > highScore) {
      setHighScore(flooredScore);
      safeLocalStorage.setNumber('tangerine_master_high_score', flooredScore);
    }
  }, [highScore]);

  return { highScore, updateHighScore, isReady };
} 