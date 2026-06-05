import type { GameId } from "@/lib/api-utils";

export type GameAssets = {
  bgm: string;
  sfx: string;
  warning?: string;
};

export type GameMeta = {
  id: GameId;
  title: string;
  apiUrl: string;
  sessionUrl: string;
  giscusTerm: string;
  audio: GameAssets;
  portraitDescription: string;
  portraitTips: readonly string[];
  rules: readonly string[];
};

export const TANGERINE_GAME: GameMeta = {
  id: "tangerine",
  title: "천혜향 게임",
  apiUrl: "/api/tangerine-game",
  sessionUrl: "/api/tangerine-game/session",
  giscusTerm: "천혜향 게임",
  audio: {
    bgm: "/orange-game/orange-game-bgm.mp3",
    sfx: "/orange-game/success.mp3",
  },
  portraitDescription: "천혜향 게임은 가로 모드에서 더 편리하게 즐길 수 있어요.",
  portraitTips: [
    "세로 모드: 화면이 좁아서 게임하기 어려워요",
    "가로 모드: 넓은 화면으로 편리하게 게임할 수 있어요",
    "10x20 격자 게임이므로 가로 모드가 최적화되어 있어요",
  ],
  rules: [
    "연속된 천혜향을 클릭하여 선택하세요 (가로, 세로)",
    "선택된 천혜향들의 합이 10이 되면 점수를 획득합니다",
    "1분 안에 최대한 높은 점수를 얻으세요",
    "합이 10을 초과하면 선택이 초기화됩니다",
    "연속되지 않은 천혜향은 선택할 수 없습니다",
  ],
};

export const MASTER_GAME: GameMeta = {
  id: "master",
  title: "귤림고수",
  apiUrl: "/api/tangerine-master",
  sessionUrl: "/api/tangerine-master/session",
  giscusTerm: "귤림고수",
  audio: {
    bgm: "/tangerine-master/tangerine-master-bgm.mp3",
    sfx: "/tangerine-master/fail.mp3",
    warning: "/tangerine-master/warning.mp3",
  },
  portraitDescription: "귤림고수는 가로 모드에서 더 편리하게 즐길 수 있어요.",
  portraitTips: [
    "세로 모드: 화면이 좁아서 게임하기 어려워요",
    "가로 모드: 넓은 화면으로 편리하게 게임할 수 있어요",
    "방향키로 캐릭터를 조작하는 게임이므로 가로 모드가 최적화되어 있어요",
  ],
  rules: [
    "방향키 또는 WASD로 나낭이를 조작하세요",
    "날아오는 귤들을 피해서 최대한 오래 살아남으세요",
    "HIT WAVE가 등장하면 귤이 몰려옵니다. 주의하세요",
    "시간이 지날수록 귤이 더 많고 빠르게 등장합니다",
    "귤에 한 번이라도 맞으면 게임 오버입니다",
  ],
};
