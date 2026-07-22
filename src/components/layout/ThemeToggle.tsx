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
    return <span aria-hidden="true" className="inline-block size-11" />;
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={isDark}
      className="inline-flex size-11 cursor-pointer items-center justify-center text-brand transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60"
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
