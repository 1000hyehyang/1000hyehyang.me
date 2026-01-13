"use client";

import { motion } from "framer-motion";

export const TerminalCursor = () => (
  <motion.span
    animate={{ opacity: [1, 0] }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    className="inline-block w-0.5 h-4 bg-orange-300 ml-1 align-middle"
    aria-hidden="true"
  />
);
