"use client";

import { motion } from "framer-motion";
import { getTechIconSrc } from "@/constants/techIconMap";
import Image from "next/image";

type TechIconProps = {
  tech: string;
  index: number;
};

export const TechIcon = ({ tech, index }: TechIconProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="w-14 h-14 rounded-lg bg-muted/40 dark:bg-muted/60 flex items-center justify-center hover:bg-muted/60 dark:hover:bg-muted/80 transition-all duration-200"
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt={`${tech} 아이콘`}
          width={36}
          height={36}
          className="w-9 h-9 object-contain"
        />
      ) : (
        <span className="text-xs text-muted-foreground">{tech}</span>
      )}
    </motion.div>
  );
};
