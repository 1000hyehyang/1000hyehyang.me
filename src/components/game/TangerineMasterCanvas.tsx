"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Tangerine, Player } from "@/lib/tangerine-master";

interface TangerineMasterCanvasProps {
  tangerines: Tangerine[];
  player: Player;
  gameArea: {
    width: number;
    height: number;
  };
  isPlaying: boolean;
  isPaused: boolean;
}

const BACKGROUND_COLOR = '#1a1a1a';
const PAUSE_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.7)';
const PAUSE_TEXT_COLOR = '#ffffff';
const PAUSE_FONT = 'bold 36px Arial';

export const TangerineMasterCanvas = ({ 
  tangerines, 
  player, 
  gameArea, 
  isPlaying, 
  isPaused 
}: TangerineMasterCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tangerineImageRef = useRef<HTMLImageElement | null>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // 이미지 로드 (한 번만 실행)
  useEffect(() => {
    if (!tangerineImageRef.current) {
      const tangerineImage = new Image();
      tangerineImage.src = '/tangerine-master/tangerine.svg';
      tangerineImageRef.current = tangerineImage;
    }

    if (!playerImageRef.current) {
      const playerImage = new Image();
      playerImage.src = '/tangerine-master/nanang.png';
      playerImageRef.current = playerImage;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = gameArea.width;
    canvas.height = gameArea.height;

    const tangerineImage = tangerineImageRef.current;
    const playerImage = playerImageRef.current;

    // 배경 렌더링
    const renderBackground = () => {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);
    };

    // 귤 렌더링
    const renderTangerines = () => {
      if (!isPlaying || !tangerineImage?.complete) return;

      tangerines.forEach(tangerine => {
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

    // 플레이어 렌더링
    const renderPlayer = () => {
      if (!playerImage?.complete) return;

      ctx.save();
      ctx.translate(player.x, player.y);
      
      const playerWidth = player.size;
      const playerHeight = player.size * (playerImage.height / playerImage.width);
      ctx.drawImage(
        playerImage,
        -playerWidth / 2,
        -playerHeight / 2,
        playerWidth,
        playerHeight
      );
      ctx.restore();
    };

    // 일시정지 오버레이 렌더링
    const renderPauseOverlay = () => {
      if (!isPaused) return;

      ctx.fillStyle = PAUSE_OVERLAY_COLOR;
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);
      
      ctx.fillStyle = PAUSE_TEXT_COLOR;
      ctx.font = PAUSE_FONT;
      ctx.textAlign = 'center';
      ctx.fillText('일시정지', gameArea.width / 2, gameArea.height / 2);
    };

    const render = () => {
      ctx.clearRect(0, 0, gameArea.width, gameArea.height);
      renderBackground();
      renderTangerines();
      renderPlayer();
      renderPauseOverlay();

      // 일시정지가 아닐 때만 애니메이션 계속
      if (!isPaused) {
        animationIdRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [tangerines, player, gameArea, isPlaying, isPaused]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg bg-gray-900"
        style={{
          width: gameArea.width,
          height: gameArea.height,
          maxWidth: '100%',
          maxHeight: '70vh'
        }}
      />
    </motion.div>
  );
}; 