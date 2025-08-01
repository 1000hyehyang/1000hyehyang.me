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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = gameArea.width;
    canvas.height = gameArea.height;

    // 이미지 로드
    const tangerineImage = new Image();
    tangerineImage.src = '/tangerine-master/tangerine.svg';
    tangerineImageRef.current = tangerineImage;

    const playerImage = new Image();
    playerImage.src = '/tangerine-master/nanang.png';
    playerImageRef.current = playerImage;

    let animationId: number;

    const render = () => {
      // 캔버스 클리어
      ctx.clearRect(0, 0, gameArea.width, gameArea.height);

      // 미니멀한 배경
      ctx.fillStyle = '#1a1a1a'; // 어두운 회색
      ctx.fillRect(0, 0, gameArea.width, gameArea.height);

      // 귤들 렌더링
      tangerines.forEach(tangerine => {
        if (tangerineImage.complete) {
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
        }
      });

      // 플레이어 렌더링
      if (playerImage.complete) {
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // 플레이어 이미지 (원본 비율 유지)
        const playerWidth = player.size;
        const playerHeight = player.size * (playerImage.height / playerImage.width); // 원본 비율 유지
        ctx.drawImage(
          playerImage,
          -playerWidth / 2,
          -playerHeight / 2,
          playerWidth,
          playerHeight
        );
        ctx.restore();
      }

      // 일시정지 오버레이
      if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameArea.width, gameArea.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('일시정지', gameArea.width / 2, gameArea.height / 2);
      }

      // 게임 중일 때만 애니메이션 계속
      if (isPlaying && !isPaused) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
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