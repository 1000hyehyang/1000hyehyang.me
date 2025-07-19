"use client";

import { PortfolioFrontmatter } from "@/types";
import { PortfolioCard } from "./PortfolioCard";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface PortfolioListProps {
  projects: PortfolioFrontmatter[];
}

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: -25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const groupVariants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const PortfolioList = ({ projects }: PortfolioListProps) => {
  const [selectedTab, setSelectedTab] = useState<"project" | "hackathon">("project");

  const groupedProjects = useMemo(() => {
    const groups: { [key: string]: PortfolioFrontmatter[] } = {};
    
    projects.forEach(project => {
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
  }, [projects]);

  const handleTabClick = (tab: "project" | "hackathon") => {
    setSelectedTab(tab);
  };

  return (
    <section className="w-full">
      {/* 상단 탭 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleTabClick("project")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "project"
                ? "bg-muted/50 text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            }`}
            aria-label="프로젝트 탭"
            tabIndex={0}
          >
            프로젝트
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("hackathon")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "hackathon"
                ? "bg-muted/50 text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            }`}
            aria-label="해커톤 탭"
            tabIndex={0}
          >
            해커톤
          </button>
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        key={selectedTab}
      >
        {groupedProjects.map(({ year, projects }) => (
          <motion.div key={year} variants={groupVariants} className="mb-14">
            <h2 className="text-xl font-semibold mb-4">{year}.</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <PortfolioCard key={project.slug} {...project} variants={cardVariants} />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}; 