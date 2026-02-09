import { Suspense } from "react";
import { getAllPortfolio } from "@/lib/mdx";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "프로젝트와 해커톤 여정을 한눈에. 서툴던 시작부터 지금까지의 배움의 흔적을 담았습니다.",
  alternates: {
    canonical: '/portfolio',
  },
};

export default function PortfolioListPage() {
  const projects = getAllPortfolio();
  return (
    <Suspense
      fallback={
        <section className="w-full animate-pulse">
          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 rounded-md bg-muted/40" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted/40" />
            ))}
          </div>
        </section>
      }
    >
      <PortfolioList projects={projects} />
    </Suspense>
  );
} 