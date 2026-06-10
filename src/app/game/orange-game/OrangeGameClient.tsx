"use client";

import dynamic from "next/dynamic";

const TangerineGame = dynamic(
  () => import("@/components/game/TangerineGame").then((mod) => mod.TangerineGame),
  { ssr: false }
);

export function OrangeGameClient() {
  return <TangerineGame />;
}
