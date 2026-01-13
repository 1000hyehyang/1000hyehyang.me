"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { containerVariants } from "@/lib/animations";
import { ProfileSection } from "./ProfileSection";
import { IntroSection } from "./IntroSection";
import { ContactSection } from "./ContactSection";
import { VisitorCounter } from "./VisitorCounter";
import { DevelopmentPrinciplesSection } from "./DevelopmentPrinciplesSection";
import { TechStackSection } from "./TechStackSection";

export const HomeContent = () => {
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
      <main className="w-full flex flex-col items-center gap-12">
        <VisitorCounter />
        <ProfileSection />
        <IntroSection />
        <DevelopmentPrinciplesSection />
        <TechStackSection />
        <ContactSection />
      </main>
    </motion.div>
  );
}; 