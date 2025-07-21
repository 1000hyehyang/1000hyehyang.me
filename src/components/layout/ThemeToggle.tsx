"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent text-orange-300 dark:text-orange-200"
      onClick={handleToggle}
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleToggle(); }}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}; 