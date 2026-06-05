"use client";

import { motion } from "framer-motion";

type GamePageTitleProps = {
  title: string;
  delay?: number;
};

export const GamePageTitle = ({ title, delay = 0 }: GamePageTitleProps) => (
  <motion.div
    className="text-center mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <h1 className="text-xl font-semibold mb-2">{title}</h1>
  </motion.div>
);
