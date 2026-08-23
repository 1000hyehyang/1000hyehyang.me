"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type ResumeRevealProps = {
  children: ReactNode;
  className?: string;
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function ResumeReveal({ children, className }: ResumeRevealProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={revealVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
