"use client";
import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Tangerine,
  Player,
  SpawnWarning,
  HitWaveState,
} from "@/lib/tangerine-master";

interface TangerineMasterCanvasProps {
  tangerines: Tangerine[];
  spawnWarnings: SpawnWarning[];
  hitWave: HitWaveState | null;
  player: Player;
  gameArea: {
    width: number;
    height: number;
  };
  isPlaying: boolean;
  isPaused: boolean;
}

const BACKGROUND_COLOR = "#1a1a1a";
const PAUSE_OVERLAY_COLOR = "rgba(0, 0, 0, 0.7)";
const PAUSE_TEXT_COLOR = "#ffffff";
const PAUSE_FONT = "bold 36px Arial";
const MAX_HEIGHT_RATIO = 0.7;

type CanvasMetrics = {
  displayWidth: number;
  displayHeight: number;
  dpr: number;
};

const getCanvasMetrics = (
  containerWidth: number,
  gameArea: { width: number; height: number }
): CanvasMetrics => {
  const aspect = gameArea.width / gameArea.height;
  const maxHeight = window.innerHeight * MAX_HEIGHT_RATIO;
  const widthLimit = Math.min(containerWidth, gameArea.width);

  let displayWidth = widthLimit;
  let displayHeight = displayWidth / aspect;

  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = displayHeight * aspect;
  }

  return {
    displayWidth: Math.max(1, Math.floor(displayWidth)),
    displayHeight: Math.max(1, Math.floor(displayHeight)),
    dpr: window.devicePixelRatio || 1,
  };
};

export const TangerineMasterCanvas = ({
  tangerines,
  spawnWarnings,
  hitWave,
  player,
  gameArea,
  isPlaying,
  isPaused,
}: TangerineMasterCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tangerineImageRef = useRef<HTMLImageElement | null>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const spawnWarningsRef = useRef(spawnWarnings);
  const hitWaveRef = useRef(hitWave);
  const tangerinesRef = useRef(tangerines);
  const playerRef = useRef(player);
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(isPaused);
  const metricsRef = useRef<CanvasMetrics>({
    displayWidth: gameArea.width,
    displayHeight: gameArea.height,
    dpr: 1,
  });

  useEffect(() => {
    spawnWarningsRef.current = spawnWarnings;
  }, [spawnWarnings]);

  useEffect(() => {
    hitWaveRef.current = hitWave;
  }, [hitWave]);

  useEffect(() => {
    tangerinesRef.current = tangerines;
  }, [tangerines]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!tangerineImageRef.current) {
      const tangerineImage = new Image();
      tangerineImage.src = "/tangerine-master/tangerine.svg";
      tangerineImageRef.current = tangerineImage;
    }

    if (!playerImageRef.current) {
      const playerImage = new Image();
      playerImage.src = "/tangerine-master/master-nanang.png";
      playerImageRef.current = playerImage;
    }
  }, []);

  const syncCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const metrics = getCanvasMetrics(container.clientWidth, gameArea);
    metricsRef.current = metrics;

    canvas.style.width = `${metrics.displayWidth}px`;
    canvas.style.height = `${metrics.displayHeight}px`;
    canvas.width = Math.round(metrics.displayWidth * metrics.dpr);
    canvas.height = Math.round(metrics.displayHeight * metrics.dpr);
  }, [gameArea]);

  useEffect(() => {
    syncCanvasSize();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      syncCanvasSize();
    });
    observer.observe(container);

    const handleWindowResize = () => {
      syncCanvasSize();
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [syncCanvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tangerineImage = tangerineImageRef.current;
    const playerImage = playerImageRef.current;

    const applyTransform = () => {
      const { displayWidth, displayHeight, dpr } = metricsRef.current;
      const scale = displayWidth / gameArea.width;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    const renderBackground = () => {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);
    };

    const renderHitWaveOverlay = (now: number) => {
      const wave = hitWaveRef.current;
      if (!isPlayingRef.current || !wave || now >= wave.endsAt) return;

      const elapsed = now - wave.startedAt;
      const pulse = (Math.sin(elapsed / 110) + 1) / 2;

      ctx.fillStyle = `rgba(160, 20, 20, ${0.12 + pulse * 0.28})`;
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);

      ctx.fillStyle = `rgba(255, 70, 50, ${0.75 + pulse * 0.25})`;
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 40, 40, 0.9)";
      ctx.shadowBlur = 12 + pulse * 10;
      ctx.fillText("HIT WAVE", gameArea.width / 2, 44);
      ctx.shadowBlur = 0;
    };

    const renderHitWaveRing = (now: number) => {
      const wave = hitWaveRef.current;
      if (!isPlayingRef.current || !wave || now >= wave.endsAt) return;

      const elapsed = now - wave.startedAt;
      const pulse = (Math.sin(elapsed / 110) + 1) / 2;
      const { centerX, centerY, ringRadius } = wave;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 80, 50, ${0.3 + pulse * 0.45})`;
      ctx.lineWidth = 2 + pulse * 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const renderSpawnWarnings = (now: number) => {
      if (!isPlayingRef.current) return;

      const lineLength = Math.max(gameArea.width, gameArea.height) * 1.5;

      spawnWarningsRef.current.forEach((warning) => {
        if (warning.kind === "hit-wave") return;

        const duration = warning.spawnAt - warning.createdAt;
        const progress = Math.min(1, (now - warning.createdAt) / duration);
        const alpha = 0.35 + progress * 0.55;
        const speed = Math.hypot(warning.vx, warning.vy) || 1;
        const dirX = warning.vx / speed;
        const dirY = warning.vy / speed;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 90, 40, ${alpha})`;
        ctx.lineWidth = 2 + progress * 2;
        ctx.shadowColor = "rgba(255, 120, 50, 0.9)";
        ctx.shadowBlur = 8 + progress * 12;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(warning.x, warning.y);
        ctx.lineTo(
          warning.x + dirX * lineLength,
          warning.y + dirY * lineLength
        );
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 150, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(warning.x, warning.y, 4 + progress * 2, 0, Math.PI * 2);
        ctx.fill();

        const previewDistance = 60 * (1 - progress);
        const previewX = warning.x - dirX * previewDistance;
        const previewY = warning.y - dirY * previewDistance;

        if (tangerineImage?.complete) {
          ctx.globalAlpha = 0.25 + progress * 0.45;
          ctx.save();
          ctx.translate(previewX, previewY);
          ctx.rotate((warning.rotation * Math.PI) / 180);
          ctx.drawImage(
            tangerineImage,
            -warning.size / 2,
            -warning.size / 2,
            warning.size,
            warning.size
          );
          ctx.restore();
        }

        ctx.restore();
      });
    };

    const renderTangerines = () => {
      if (!isPlayingRef.current || !tangerineImage?.complete) return;

      tangerinesRef.current.forEach((tangerine) => {
        ctx.save();
        ctx.translate(tangerine.x, tangerine.y);
        ctx.rotate((tangerine.rotation * Math.PI) / 180);
        ctx.drawImage(
          tangerineImage,
          -tangerine.size / 2,
          -tangerine.size / 2,
          tangerine.size,
          tangerine.size
        );
        ctx.restore();
      });
    };

    const drawPlayerAt = (x: number, y: number, size: number) => {
      if (!playerImage?.complete) return;

      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));

      const playerWidth = size;
      const playerHeight = size * (playerImage.height / playerImage.width);
      ctx.drawImage(
        playerImage,
        -playerWidth / 2,
        -playerHeight / 2,
        playerWidth,
        playerHeight
      );
      ctx.restore();
    };

    const renderPlayer = () => {
      const currentPlayer = playerRef.current;
      drawPlayerAt(currentPlayer.x, currentPlayer.y, currentPlayer.size);
    };

    const renderIdlePlayer = () => {
      const currentPlayer = playerRef.current;
      drawPlayerAt(
        gameArea.width / 2,
        gameArea.height / 2,
        currentPlayer.size
      );
    };

    const renderPauseOverlay = () => {
      ctx.fillStyle = PAUSE_OVERLAY_COLOR;
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);

      ctx.fillStyle = PAUSE_TEXT_COLOR;
      ctx.font = PAUSE_FONT;
      ctx.textAlign = "center";
      ctx.fillText("일시정지", gameArea.width / 2, gameArea.height / 2);
    };

    const render = () => {
      const now = Date.now();
      applyTransform();
      ctx.clearRect(0, 0, gameArea.width, gameArea.height);
      renderBackground();

      if (isPausedRef.current) {
        renderTangerines();
        renderPlayer();
        renderPauseOverlay();
      } else if (isPlayingRef.current) {
        renderHitWaveOverlay(now);
        renderHitWaveRing(now);
        renderSpawnWarnings(now);
        renderTangerines();
        renderPlayer();
      } else {
        renderIdlePlayer();
      }

      animationIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [gameArea]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <canvas
        ref={canvasRef}
        className="mx-auto block border border-border rounded-lg bg-gray-900"
      />
    </motion.div>
  );
};
