"use client";

import dynamic from "next/dynamic";

const TangerineMasterGame = dynamic(
  () =>
    import("@/components/game/TangerineMasterGame").then((mod) => mod.TangerineMasterGame),
  { ssr: false }
);

export function TangerineMasterGameClient() {
  return <TangerineMasterGame />;
}
