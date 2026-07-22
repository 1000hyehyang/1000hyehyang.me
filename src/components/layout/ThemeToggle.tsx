"use client";

import { useThemeCircleTransition } from "@/hooks/useThemeCircleTransition";
import { AnimatedThemeIcon } from "./AnimatedThemeIcon";

export function ThemeToggle() {
  const {
    isDark,
    isMounted,
    isTransitioning,
    shouldReduceMotion,
    toggleTheme,
  } = useThemeCircleTransition();

  if (!isMounted) {
    return <span aria-hidden="true" className="inline-block size-9" />;
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-orange-200 transition-colors hover:bg-accent"
      onClick={toggleTheme}
      disabled={isTransitioning}
    >
      <AnimatedThemeIcon
        showMoon={!isDark}
        reduceMotion={shouldReduceMotion}
      />
    </button>
  );
}
