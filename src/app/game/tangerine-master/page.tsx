import dynamic from "next/dynamic";
import type { Metadata } from "next";

const TangerineMasterGame = dynamic(() =>
  import("@/components/game/TangerineMasterGame").then((mod) => mod.TangerineMasterGame)
);

export const metadata: Metadata = {
  title: "귤림고수",
  description: "귤은 맞으면 아픕니다.",
  alternates: {
    canonical: '/game/tangerine-master',
  },
};

export default function TangerineMasterPage() {
  return <TangerineMasterGame />;
}
