"use client";

import { motion } from "framer-motion";
import { getTechIconSrc } from "@/constants/techIconMap";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TECH_ICON_ANIMATION, getAnimationDelay, TECH_ICON_STYLES } from "@/lib/tech-icon-utils";

type TechIconProps = {
  tech: string;
  index: number;
};

export const TechIcon = ({ tech, index }: TechIconProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={TECH_ICON_ANIMATION.initial}
          animate={TECH_ICON_ANIMATION.animate}
          transition={{ ...TECH_ICON_ANIMATION.transition, delay: getAnimationDelay(index) }}
          className={TECH_ICON_STYLES.icon}
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
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        sideOffset={8}
        className="bg-popover text-popover-foreground border border-border shadow-none"
      >
        {tech}
      </TooltipContent>
    </Tooltip>
  );
};
