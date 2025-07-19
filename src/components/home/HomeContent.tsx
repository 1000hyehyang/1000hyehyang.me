"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { containerVariants } from "@/lib/animations";
import { BlogFrontmatter } from "@/types";
import { ProfileSection } from "./ProfileSection";
import { IntroSection } from "./IntroSection";
import { ContactSection } from "./ContactSection";

interface HomeContentProps {
  posts: BlogFrontmatter[];
}

export const HomeContent = ({ posts }: HomeContentProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="flex flex-col min-h-screen items-center justify-between pt-12"
    >
      <main className="w-full flex flex-col items-center gap-8">
        <ProfileSection />
        <IntroSection />
        <ContactSection />
      </main>
    </motion.div>
  );
}; 