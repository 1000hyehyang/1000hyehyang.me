import { create } from 'zustand';
import { useEffect } from 'react';
import { safeLocalStorage, logger } from './utils';

export interface Tangerine {
  id: string;
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  timeLeft: number;
  score: number;
  highScore: number;
  tangerines: Tangerine[][];
  selectedTangerines: Tangerine[];
  gridRows: number;
  gridCols: number;
  targetSum: number;
  gameDuration: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  selectTangerine: (tangerine: Tangerine) => void;
  deselectTangerine: (tangerine: Tangerine) => void;
  clearSelection: () => void;
  removeTangerines: (tangerines: Tangerine[], onSuccess?: () => void) => void;
  addNewTangerines: () => void;
  updateTime: () => void;
  updateHighScore: (score: number) => void;
  generateNewGrid: () => void;
  setHighScore: (score: number) => void;
}

const generateTangerine = (row: number, col: number): Tangerine => ({
  id: `${row}-${col}-${Date.now()}-${Math.random()}`,
  value: Math.floor(Math.random() * 9) + 1,
  row,
  col,
  isSelected: false,
});

const generateGrid = (rows: number, cols: number): Tangerine[][] => {
  const grid: Tangerine[][] = [];
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = generateTangerine(row, col);
    }
  }
  return grid;
};

const isAdjacent = (tangerine1: Tangerine, tangerine2: Tangerine): boolean => {
  const rowDiff = Math.abs(tangerine1.row - tangerine2.row);
  const colDiff = Math.abs(tangerine1.col - tangerine2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

const isConsecutive = (selectedTangerines: Tangerine[]): boolean => {
  if (selectedTangerines.length <= 1) return true;
  const visited = new Set<string>();
  const queue: Tangerine[] = [selectedTangerines[0]];
  visited.add(selectedTangerines[0].id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const tangerine of selectedTangerines) {
      if (!visited.has(tangerine.id) && isAdjacent(current, tangerine)) {
        visited.add(tangerine.id);
        queue.push(tangerine);
      }
    }
  }
  return visited.size === selectedTangerines.length;
};

export const useTangerineGameStore = create<GameState>((set, get) => ({
  isPlaying: false,
  isPaused: false,
  timeLeft: 60,
  score: 0,
  highScore: 0, // Always 0 for SSR/CSR match
  tangerines: [],
  selectedTangerines: [],
  gridRows: 10,
  gridCols: 20,
  targetSum: 10,
  gameDuration: 60,

  startGame: () => {
    set((state) => ({
      isPlaying: true,
      isPaused: false,
      timeLeft: 60,
      score: 0,
      selectedTangerines: [],
      tangerines: generateGrid(10, 20),
      highScore: state.highScore,
    }));
  },

  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  endGame: () => {
    const { score, highScore } = get();
    const newHighScore = Math.max(score, highScore);
    set({
      isPlaying: false,
      isPaused: false,
      highScore: newHighScore,
    });
    if (typeof window !== 'undefined' && newHighScore > highScore) {
      localStorage.setItem('tangerine_high_score', String(newHighScore));
    }
  },

  resetGame: () => {
    set({
      isPlaying: false,
      isPaused: false,
      timeLeft: 60,
      score: 0,
      selectedTangerines: [],
      tangerines: generateGrid(10, 20),
    });
  },

  selectTangerine: (tangerine) => {
    const { selectedTangerines, tangerines } = get();
    if (tangerine.isSelected) {
      get().deselectTangerine(tangerine);
      return;
    }
    const newSelectedTangerines = [...selectedTangerines, tangerine];
    if (!isConsecutive(newSelectedTangerines)) {
      return;
    }
    const newTangerines = tangerines.map(row =>
      row.map(t => t.id === tangerine.id ? { ...t, isSelected: true } : t)
    );
    set({
      selectedTangerines: newSelectedTangerines,
      tangerines: newTangerines,
    });
    const sum = newSelectedTangerines.reduce((acc, t) => acc + t.value, 0);
    if (sum === 10) {
      get().removeTangerines(newSelectedTangerines, () => {
        const sfxMuted = safeLocalStorage.getBoolean('sfx-muted');
        if (!sfxMuted) {
          const audio = new Audio('/orange-game/success.mp3');
          audio.volume = 0.5;
          audio.play().catch((error) => logger.error('성공 사운드 재생 실패:', error));
        }
      });
    } else if (sum > 10) {
      get().clearSelection();
    }
  },

  deselectTangerine: (tangerine) => {
    const { selectedTangerines, tangerines } = get();
    const newSelectedTangerines = selectedTangerines.filter(t => t.id !== tangerine.id);
    const newTangerines = tangerines.map(row =>
      row.map(t => t.id === tangerine.id ? { ...t, isSelected: false } : t)
    );
    set({
      selectedTangerines: newSelectedTangerines,
      tangerines: newTangerines,
    });
  },

  clearSelection: () => {
    const { tangerines } = get();
    const newTangerines = tangerines.map(row =>
      row.map(t => ({ ...t, isSelected: false }))
    );
    set({
      selectedTangerines: [],
      tangerines: newTangerines,
    });
  },

  removeTangerines: (tangerinesToRemove, onSuccess) => {
    const { tangerines, score } = get();
    const newTangerines = tangerines.map(row =>
      row.map(t =>
        tangerinesToRemove.some(tr => tr.id === t.id)
          ? generateTangerine(t.row, t.col)
          : t
      )
    );
    const newScore = score + tangerinesToRemove.length * 10;
    set({
      tangerines: newTangerines,
      selectedTangerines: [],
      score: newScore,
    });
    if (onSuccess) {
      onSuccess();
    }
  },

  addNewTangerines: () => {
    const { tangerines } = get();
    const newTangerines = tangerines.map(row =>
      row.map(t => t.value === 0 ? generateTangerine(t.row, t.col) : t)
    );
    set({ tangerines: newTangerines });
  },

  updateTime: () => {
    const { timeLeft, isPlaying, isPaused } = get();
    if (isPlaying && !isPaused && timeLeft > 0) {
      const newTimeLeft = timeLeft - 1;
      if (newTimeLeft <= 0) {
        set({ timeLeft: 0 });
        get().endGame();
      } else {
        set({ timeLeft: newTimeLeft });
      }
    }
  },

  updateHighScore: (score: number) => {
    const { highScore } = get();
    if (score > highScore) {
      set({ highScore: score });
      safeLocalStorage.setNumber('tangerine_high_score', score);
    }
  },

  generateNewGrid: () => {
    set({ tangerines: generateGrid(10, 20) });
  },

  setHighScore: (score: number) => {
    set({ highScore: score });
  },
}));

// Custom hook to sync highScore from localStorage on client
export function useSyncHighScoreWithLocalStorage() {
  const setHighScore = useTangerineGameStore((state) => state.setHighScore);
  useEffect(() => {
    const saved = safeLocalStorage.getNumber('tangerine_high_score');
    if (saved > 0) setHighScore(saved);
  }, [setHighScore]);
} 