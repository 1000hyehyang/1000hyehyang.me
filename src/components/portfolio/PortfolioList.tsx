"use client";

import { PortfolioFrontmatter } from "@/types";
import { PortfolioCard } from "./PortfolioCard";
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { listVariants, cardVariants, groupVariants } from "@/lib/animations";

interface PortfolioListProps {
  projects: PortfolioFrontmatter[];
}

export const PortfolioList = ({ projects }: PortfolioListProps) => {
  // 사용 가능한 카테고리 목록 생성
  const availableCategories = useMemo(() => {
    const categories = new Set(projects.map(project => project.category));
    return Array.from(categories) as ("project" | "hackathon")[];
  }, [projects]);

  // 기본 카테고리를 사용 가능한 카테고리 중 첫 번째로 설정
  const [selectedCategory, setSelectedCategory] = useState<"project" | "hackathon">("project");

  // availableCategories가 변경될 때 기본 카테고리 업데이트
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  // 선택된 카테고리로 필터링된 프로젝트들
  const filteredProjects = useMemo(() => {
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

  const handleCategoryClick = (category: "project" | "hackathon") => {
    setSelectedCategory(category);
  };

  // 카테고리 라벨 매핑
  const categoryLabels = {
    project: "프로젝트",
    hackathon: "해커톤"
  };

  return (
    <section className="w-full">
      {/* 상단 탭 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
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
            {`${categoryLabels[selectedCategory]} 카테고리의 프로젝트가 없습니다.`}
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