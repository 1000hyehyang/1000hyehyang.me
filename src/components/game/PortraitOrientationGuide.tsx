"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

type PortraitOrientationGuideProps = {
  title: string;
  description: string;
  tips: readonly string[];
};

export const PortraitOrientationGuide = ({
  title,
  description,
  tips,
}: PortraitOrientationGuideProps) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div
      className="text-center max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <motion.div
          className="w-16 h-16 mx-auto mb-6 bg-foreground rounded-full flex items-center justify-center"
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <RotateCcw className="w-8 h-8 text-background" />
        </motion.div>
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground">화면을 가로로 돌려주세요</p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          {tips.map((tip) => (
            <p key={tip}>• {tip}</p>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);
