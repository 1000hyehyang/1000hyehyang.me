"use client";

import Image from "next/image";

import { getTechIconSrc } from "@/constants/techIconMap";

type TechBadgeProps = {
  tech: string;
};

export const TechBadge = ({ tech }: TechBadgeProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground leading-none">
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={`${tech} 아이콘`}
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      )}
      <span className="leading-none">{tech}</span>
    </span>
  );
};

