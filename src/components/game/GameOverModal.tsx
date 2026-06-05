"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatGameOverRankMessage } from "@/lib/game-leaderboard";

type GameOverModalProps = {
  isOpen: boolean;
  scoreDisplay: ReactNode;
  isNewRecord: boolean;
  previewRank: number | null;
  previewInHallOfFame: boolean;
  isRankLoading: boolean;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onPlayerNameKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  isSaving: boolean;
  saveError: string | null;
  onRegister: () => void;
  onClose: () => void;
};

export const GameOverModal = ({
  isOpen,
  scoreDisplay,
  isNewRecord,
  previewRank,
  previewInHallOfFame,
  isRankLoading,
  playerName,
  onPlayerNameChange,
  onPlayerNameKeyDown,
  isSaving,
  saveError,
  onRegister,
  onClose,
}: GameOverModalProps) => (
  <AnimatePresence>
    {isOpen && (
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
          <h2 className="text-lg font-semibold text-center mb-4">게임 오버</h2>
          <div className="text-center mb-6">
            {scoreDisplay}
            {isNewRecord && (
              <p className="text-sm text-muted-foreground">
                {isRankLoading
                  ? "순위 확인 중..."
                  : previewRank !== null
                    ? formatGameOverRankMessage(previewRank, previewInHallOfFame)
                    : null}
              </p>
            )}
          </div>

          {isNewRecord && (
            <div className="mb-6">
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                플레이어명
              </label>
              <input
                id="playerName"
                name="playerName"
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                onKeyDown={onPlayerNameKeyDown}
                placeholder="이름을 입력하세요"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/20 focus:bg-background"
                maxLength={20}
                disabled={isSaving}
              />
            </div>
          )}

          {saveError && (
            <p className="mb-4 text-center text-sm text-destructive">{saveError}</p>
          )}

          <div className="flex gap-3 justify-center">
            {isNewRecord && (
              <button
                className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                  isSaving || !playerName.trim()
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
                onClick={onRegister}
                disabled={isSaving || !playerName.trim()}
              >
                {isSaving ? "등록 중..." : "등록"}
              </button>
            )}
            <button
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm font-medium transition-colors cursor-pointer"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
