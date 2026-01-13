// 기술 아이콘 관련 공통 상수 및 유틸리티

export const TECH_ICON_ANIMATION = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
} as const;

export const getAnimationDelay = (index: number) => index * 0.05;

export const TECH_ICON_STYLES = {
  icon: "w-14 h-14 rounded-lg bg-muted/40 dark:bg-muted/60 flex items-center justify-center hover:bg-muted/60 dark:hover:bg-muted/80 transition-all duration-200 cursor-pointer",
  badge: "inline-flex items-center gap-2 rounded-md bg-muted/40 dark:bg-muted/60 px-3 py-1.5 hover:bg-muted/60 dark:hover:bg-muted/80 transition-all duration-200",
} as const;
