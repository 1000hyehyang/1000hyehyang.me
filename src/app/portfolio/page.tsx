import { getAllPortfolio } from "@/lib/mdx";
import { PortfolioList } from "@/components/portfolio/PortfolioList";

export default function PortfolioListPage() {
  const projects = getAllPortfolio();
  return <PortfolioList projects={projects} />;
} 