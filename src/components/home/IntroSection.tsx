"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { itemVariants } from "@/lib/animations";
import { INTRO_ITEMS } from "@/lib/intro-data";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { TrafficLights } from "./intro/TrafficLights";
import { TerminalContent } from "./intro/TerminalContent";

export const IntroSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const displayedText = useTypingAnimation(INTRO_ITEMS, isInView);

  return (
    <motion.section 
      ref={sectionRef}
      variants={itemVariants} 
      className="w-full max-w-2xl"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <h1 className="text-xl font-semibold mb-6">안녕하세요, 개발자 여채현입니다.</h1>
      
      <div className="min-h-[140px] overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface">
        <TrafficLights />
        <TerminalContent text={displayedText} />
      </div>
    </motion.section>
  );
};
