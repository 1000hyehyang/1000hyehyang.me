"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getTechIconSrc } from "@/constants/techIconMap";
import { TECH_ICON_ANIMATION, getAnimationDelay, TECH_ICON_STYLES } from "@/lib/tech-icon-utils";

type TechBadgeProps = {
  tech: string;
  index?: number;
};

export const TechBadge = ({ tech, index = 0 }: TechBadgeProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <motion.div
      initial={TECH_ICON_ANIMATION.initial}
      animate={TECH_ICON_ANIMATION.animate}
      transition={{ ...TECH_ICON_ANIMATION.transition, delay: getAnimationDelay(index) }}
      className={TECH_ICON_STYLES.badge}
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

