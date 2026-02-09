"use client";

import { PortfolioFrontmatter, PortfolioCategory } from "@/types";
import { PortfolioCard } from "./PortfolioCard";
import { motion } from "framer-motion";
import { useMemo, useEffect } from "react";
import { usePortfolioUrlState } from "@/hooks/usePortfolioUrlState";
import { listVariants, cardVariants, groupVariants } from "@/lib/animations";

interface PortfolioListProps {
  projects: PortfolioFrontmatter[];
}

export const PortfolioList = ({ projects }: PortfolioListProps) => {
  const { category: selectedCategory, setCategory } = usePortfolioUrlState();

  const availableCategories = useMemo(() => {
    const categories = new Set(projects.map((project) => project.category));
    return Array.from(categories) as ("project" | "hackathon")[];
  }, [projects]);

  // URL에 있는 카테고리가 현재 목록에 없으면 '전체'로 보정
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      selectedCategory !== "all" &&
      !availableCategories.includes(selectedCategory as "project" | "hackathon")
    ) {
      setCategory("all");
    }
  }, [availableCategories, selectedCategory, setCategory]);

  // 선택된 카테고리로 필터링된 프로젝트들
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects;
    }
    return projects.filter(project => project.category === selectedCategory);
  }, [projects, selectedCategory]);

  // 연도별로 그룹화
  const groupedProjects = useMemo(() => {
    const groups: { [key: string]: PortfolioFrontmatter[] } = {};
    
    filteredProjects.forEach(project => {
      const year = project.period.split(" - ")[0].split(".")[0];
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(project);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, projects]) => ({
        year,
        projects: projects.sort((a, b) => {
          const aDate = new Date(a.period.split(" - ")[0]);
          const bDate = new Date(b.period.split(" - ")[0]);
          return bDate.getTime() - aDate.getTime();
        })
      }));
  }, [filteredProjects]);

  const handleCategoryClick = (category: PortfolioCategory) => setCategory(category);

  // 카테고리 라벨 매핑
  const categoryLabels = {
    all: "전체",
    project: "프로젝트",
    hackathon: "해커톤"
  };

  return (
    <section className="w-full">
      {/* 상단 탭 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {/* 전체 탭 */}
          <button
            key="all"
            type="button"
            onClick={() => handleCategoryClick("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-muted/50 text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            }`}
            aria-label="전체 탭"
            tabIndex={0}
          >
            전체
          </button>
          {/* 개별 카테고리 탭들 */}
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory === category
                  ? "bg-muted/50 text-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
              aria-label={`${categoryLabels[category]} 탭`}
              tabIndex={0}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        key={selectedCategory}
      >
        {groupedProjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {selectedCategory === "all" 
              ? "프로젝트가 없습니다."
              : `${categoryLabels[selectedCategory]} 카테고리의 프로젝트가 없습니다.`
            }
          </div>
        ) : (
          groupedProjects.map(({ year, projects }) => (
            <motion.div key={year} variants={groupVariants} className="mb-14">
              <h2 className="text-xl font-semibold mb-4">{year}.</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {projects.map((project) => (
                  <PortfolioCard key={project.slug} {...project} variants={cardVariants} />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </section>
  );
}; 