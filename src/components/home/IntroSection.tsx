"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

export const IntroSection = () => {
  return (
    <motion.section variants={itemVariants} className="w-full max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold mb-4">안녕하세요, 여채현입니다.</h1>
      
      <p className="text-muted-foreground leading-relaxed">
      • 지식을 공유하며 소통하는 활동을 좋아합니다
      </p>
      <p className="text-muted-foreground leading-relaxed">
      • 다양한 분야를 직접 경험해야 직성이 풀립니다!
      </p>
      <p className="text-muted-foreground leading-relaxed">
      • 모르는 것은 빠르게 질문하고, 의견을 분명하게 드러냅니다
      </p>
      <p className="text-muted-foreground leading-relaxed">
      • 적합한 설계와 구조의 타당성을 중요하게 생각합니다
      </p>
    </motion.section>
  );
}; 