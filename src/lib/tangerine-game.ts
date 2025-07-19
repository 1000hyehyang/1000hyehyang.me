import { create } from 'zustand';

export interface Tangerine {
  id: string;
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
}

export interface GameState {
  // 게임 상태
  isPlaying: boolean;
  isPaused: boolean;
  timeLeft: number;
  score: number;
  highScore: number;
  
  // 천혜향 격자
  tangerines: Tangerine[][];
  selectedTangerines: Tangerine[];
  
  // 게임 설정
  gridRows: number;
  gridCols: number;
  targetSum: number;
  gameDuration: number; // 초 단위
  
  // 액션들
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
}

const generateTangerine = (row: number, col: number): Tangerine => ({
  id: `${row}-${col}-${Date.now()}-${Math.random()}`,
  value: Math.floor(Math.random() * 9) + 1, // 1-9 사이의 값
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

// 연속된 천혜향인지 확인하는 함수
const isAdjacent = (tangerine1: Tangerine, tangerine2: Tangerine): boolean => {
  const rowDiff = Math.abs(tangerine1.row - tangerine2.row);
  const colDiff = Math.abs(tangerine1.col - tangerine2.col);
  
  // 가로, 세로만 연속 선택 가능 (대각선 제외)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// 선택된 천혜향들이 연속되어 있는지 확인하는 함수
const isConsecutive = (selectedTangerines: Tangerine[]): boolean => {
  if (selectedTangerines.length <= 1) return true;
  
  // 모든 선택된 천혜향이 서로 연결되어 있는지 확인
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
  // 초기 상태
  isPlaying: false,
  isPaused: false,
  timeLeft: 60, // 1분
  score: 0,
  highScore: 0,
  tangerines: [], // 초기에는 빈 배열로 시작
  selectedTangerines: [],
  gridRows: 10,
  gridCols: 20,
  targetSum: 10,
  gameDuration: 60,

  // 게임 시작
  startGame: () => {
    set({
      isPlaying: true,
      isPaused: false,
      timeLeft: 60,
      score: 0,
      selectedTangerines: [],
      tangerines: generateGrid(10, 20),
    });
  },

  // 게임 일시정지
  pauseGame: () => {
    set({ isPaused: true });
  },

  // 게임 재개
  resumeGame: () => {
    set({ isPaused: false });
  },

  // 게임 종료
  endGame: () => {
    const { score, highScore } = get();
    const newHighScore = Math.max(score, highScore);
    
    set({
      isPlaying: false,
      isPaused: false,
      highScore: newHighScore,
    });
  },

  // 게임 리셋
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

  // 천혜향 선택
  selectTangerine: (tangerine: Tangerine) => {
    const { selectedTangerines, tangerines } = get();
    
    // 이미 선택된 천혜향이면 선택 해제
    if (tangerine.isSelected) {
      get().deselectTangerine(tangerine);
      return;
    }

    // 새로운 천혜향 선택
    const newSelectedTangerines = [...selectedTangerines, tangerine];
    
    // 연속된 천혜향인지 확인
    if (!isConsecutive(newSelectedTangerines)) {
      // 연속되지 않으면 선택 불가
      return;
    }
    
    const newTangerines = tangerines.map(row =>
      row.map(t => 
        t.id === tangerine.id ? { ...t, isSelected: true } : t
      )
    );

    set({
      selectedTangerines: newSelectedTangerines,
      tangerines: newTangerines,
    });

    // 선택된 천혜향들의 합이 10인지 확인
    const sum = newSelectedTangerines.reduce((acc, t) => acc + t.value, 0);
    if (sum === 10) {
      get().removeTangerines(newSelectedTangerines, () => {
        // 성공 사운드 재생 (효과음이 음소거되지 않은 경우에만)
        if (typeof window !== 'undefined') {
          // 효과음 음소거 상태 확인 (localStorage에서 가져오기)
          const sfxMuted = localStorage.getItem('sfx-muted') === 'true';
          if (!sfxMuted) {
            const audio = new Audio('/orange-game/success.mp3');
            audio.volume = 0.5;
            audio.play().catch(console.error);
          }
        }
      });
    } else if (sum > 10) {
      // 합이 10을 초과하면 선택 해제
      get().clearSelection();
    }
  },

  // 천혜향 선택 해제
  deselectTangerine: (tangerine: Tangerine) => {
    const { selectedTangerines, tangerines } = get();
    
    const newSelectedTangerines = selectedTangerines.filter(t => t.id !== tangerine.id);
    const newTangerines = tangerines.map(row =>
      row.map(t => 
        t.id === tangerine.id ? { ...t, isSelected: false } : t
      )
    );

    set({
      selectedTangerines: newSelectedTangerines,
      tangerines: newTangerines,
    });
  },

  // 선택 초기화
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

  // 천혜향 제거
  removeTangerines: (tangerinesToRemove: Tangerine[], onSuccess?: () => void) => {
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

    // 성공 콜백 실행
    if (onSuccess) {
      onSuccess();
    }
  },

  // 새로운 천혜향 추가
  addNewTangerines: () => {
    const { tangerines } = get();
    const newTangerines = tangerines.map(row =>
      row.map(t => 
        t.value === 0 ? generateTangerine(t.row, t.col) : t
      )
    );

    set({ tangerines: newTangerines });
  },

  // 시간 업데이트
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

  // 최고 점수 업데이트
  updateHighScore: (score: number) => {
    const { highScore } = get();
    if (score > highScore) {
      set({ highScore: score });
    }
  },

  // 새로운 격자 생성
  generateNewGrid: () => {
    set({ tangerines: generateGrid(10, 20) });
  },
})); 