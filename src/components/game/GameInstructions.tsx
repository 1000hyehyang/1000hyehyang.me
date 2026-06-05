"use client";

import { motion } from "framer-motion";

type GameInstructionsProps = {
  rules: readonly string[];
  delay?: number;
};

export const GameInstructions = ({ rules, delay = 0.4 }: GameInstructionsProps) => (
  <motion.div
    className="mt-8 p-6 bg-muted/50 rounded-lg"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <h3 className="text-lg font-semibold mb-3">게임 방법</h3>
    <ul className="space-y-2 text-sm text-muted-foreground">
      {rules.map((rule) => (
        <li key={rule}>• {rule}</li>
      ))}
    </ul>
  </motion.div>
);
