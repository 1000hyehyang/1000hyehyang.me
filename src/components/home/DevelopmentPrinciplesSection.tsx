"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { DEVELOPMENT_PRINCIPLES } from "@/lib/development-principles-data";
import { PrincipleCard } from "./PrincipleCard";

export const DevelopmentPrinciplesSection = () => {
  return (
    <motion.section 
      variants={itemVariants}
      className="w-full max-w-2xl space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEVELOPMENT_PRINCIPLES.map((principle, index) => (
          <PrincipleCard
            key={principle.acronym}
            principle={principle}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
};
