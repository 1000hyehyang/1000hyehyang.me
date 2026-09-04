"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getTechIconSrc } from "@/constants/techIconMap";

type TechBadgeProps = {
  tech: string;
  index?: number;
  disableAnimation?: boolean;
};

export const TechBadge = ({
  tech,
  index = 0,
  disableAnimation = false,
}: TechBadgeProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="inline-flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 transition-all duration-200 hover:bg-muted/60 dark:bg-muted/60 dark:hover:bg-muted/80"
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={`${tech} 아이콘`}
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      )}
      <span className="text-sm text-foreground leading-none">{tech}</span>
    </motion.div>
  );
};

