import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "그냥 놀다 가요.",
  alternates: {
    canonical: '/game',
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


