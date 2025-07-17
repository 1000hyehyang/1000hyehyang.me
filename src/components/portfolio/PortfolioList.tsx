import { PortfolioFrontmatter } from "@/types";
import { PortfolioCard } from "./PortfolioCard";

export const PortfolioList = ({ projects }: { projects: PortfolioFrontmatter[] }) => {
  return (
    <section className="w-full">
      <h1 className="text-2xl font-bold mb-6">포트폴리오</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">등록된 포트폴리오가 없습니다.</div>
        ) : (
          projects.map((project) => <PortfolioCard key={project.slug} {...project} />)
        )}
      </div>
    </section>
  );
}; 