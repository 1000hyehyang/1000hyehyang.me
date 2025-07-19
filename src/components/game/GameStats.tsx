"use client";
import { motion } from "framer-motion";
import { Clock, Star, Trophy } from "lucide-react";
import { useTangerineGameStore } from "@/lib/tangerine-game";

export const GameStats = () => {
  const { score, timeLeft, highScore } = useTangerineGameStore();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 15) return 'text-red-500';
    if (timeLeft <= 30) return 'text-yellow-500';
    return 'text-foreground';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* 현재 점수 */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">현재 점수</span>
          </div>
          <motion.span
            className="text-xl font-semibold"
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      {/* 남은 시간 */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">남은 시간</span>
          </div>
          <motion.span
            className={`text-xl font-semibold ${getTimeColor()}`}
            key={timeLeft}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>
      </div>

      {/* 최고 점수 */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">최고 점수</span>
          </div>
          <span className="text-xl font-semibold">
            {highScore}
          </span>
        </div>
      </div>
    </div>
  );
}; 