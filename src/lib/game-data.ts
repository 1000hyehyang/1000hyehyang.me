import { Citrus, Shield } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type GameItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  thumbnail?: string;
};

export const GAMES: GameItem[] = [
  {
    title: "천혜향 게임",
    description: "연속된 천혜향들을 골라 합이 10이 되는 조합을 찾아보세요",
    href: "/game/orange-game",
    icon: Citrus,
    thumbnail: "/orange-game/orange-game-thumbnail.png"
  },
  {
    title: "귤림고수",
    description: "날아오는 귤들을 피해서 최대한 오래 살아남아보세요",
    href: "/game/tangerine-master",
    icon: Shield,
    thumbnail: "/tangerine-master/tangerine-master-thumbnail.png"
  }
];
