import { TangerineGame } from "@/components/game/TangerineGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "천혜향 게임",
  description: "그니까, 합해서 10이 되는 천혜향을 고르라고요!",
  alternates: {
    canonical: '/game/orange-game',
  },
};

export default function OrangeGamePage() {
  return <TangerineGame />;
} 