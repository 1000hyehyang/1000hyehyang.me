import { TangerineMasterGame } from "@/components/game/TangerineMasterGame";
import type { Metadata } from "next";

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