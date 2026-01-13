"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { TECH_STACK } from "@/lib/tech-stack-data";
import { TechIcon } from "./TechIcon";

export const TechStackSection = () => {
  let globalIndex = 0;

  return (
    <motion.section 
      variants={itemVariants}
      className="w-full max-w-2xl space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Tech Stack.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TECH_STACK.map((category) => (
          <div key={category.category} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.technologies.map((tech) => {
                const index = globalIndex++;
                return <TechIcon key={tech} tech={tech} index={index} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
