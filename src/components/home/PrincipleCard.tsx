"use client";

import { DevelopmentPrinciple } from "@/lib/development-principles-data";

type PrincipleCardProps = {
  principle: DevelopmentPrinciple;
  index: number;
};

export const PrincipleCard = ({ principle }: PrincipleCardProps) => {
  return (
    <div className="bg-muted/25 dark:bg-muted/40 p-6 rounded-lg hover:bg-muted/40 dark:hover:bg-muted/60 transition-all duration-200">
      <div className="text-sm font-semibold text-foreground mb-3">{principle.fullName}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{principle.description}</div>
    </div>
  );
};
