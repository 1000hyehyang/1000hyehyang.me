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
  return <PortfolioList projects={projects} />;
} 