"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { GameLeaderboardEntry } from "@/lib/game-leaderboard";
import {
  formatLeaderboardDate,
  medalEmoji,
  sanitizeLeaderboardPlayerName,
} from "@/lib/game-leaderboard";

type GameLeaderboardModalProps = {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  entries: GameLeaderboardEntry[];
  onRefresh: () => void;
  /** 점수 컬럼에 표시할 문자열 (게임: 숫자, 마스터: MM:SS 등) */
  formatScore: (entry: GameLeaderboardEntry) => string;
  /** 플레이어명 sanitize 시 최대 길이 (미지정 시 잘라내지 않음) */
  playerNameMaxLength?: number;
};

export function GameLeaderboardModal({
  open,
  onClose,
  isLoading,
  entries,
  onRefresh,
  formatScore,
  playerNameMaxLength,
}: GameLeaderboardModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-leaderboard-title"
        >
          <motion.div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg border bg-card p-6"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="game-leaderboard-title" className="text-lg font-semibold">
                🏆 명예의 전당
              </h2>
              <motion.button
                type="button"
                className="cursor-pointer p-1 text-muted-foreground hover:text-foreground"
                onClick={onClose}
                aria-label="닫기"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">✕</span>
              </motion.button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">리더보드 불러오는 중...</p>
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <motion.div
                    key={`${entry.timestamp}-${entry.playerName ?? "anon"}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">
                          {medalEmoji(index)}{" "}
                          {sanitizeLeaderboardPlayerName(entry.playerName || "익명", {
                            maxLength: playerNameMaxLength,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatLeaderboardDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {formatScore(entry)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">아직 기록이 없습니다</p>
                <p className="mt-2 text-xs text-muted-foreground">첫 번째 기록을 만들어보세요!</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
              >
                {isLoading ? "새로고침 중..." : "새로고침"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
