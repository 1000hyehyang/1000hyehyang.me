"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, PenTool, Archive, Citrus } from "lucide-react";
import { useState } from "react";

const NAVS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/blog", icon: PenTool, label: "블로그" },
  { href: "/portfolio", icon: Archive, label: "프로젝트" },
  { href: "/about", icon: Citrus, label: "소개" },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      className="fixed bottom-4 inset-x-0 mx-auto z-50 flex gap-1 w-fit"
      aria-label="하단 네비게이션"
    >
      {NAVS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || focused === href;
        const isHovered = hovered === href;
        return (
          <button
            key={href}
            type="button"
            onClick={() => router.push(href)}
            onFocus={() => setFocused(href)}
            onBlur={() => setFocused(null)}
            onMouseEnter={() => setHovered(href)}
            onMouseLeave={() => setHovered(null)}
            className={
              "flex items-center justify-center p-3 rounded-lg transition-colors duration-200 select-none hover:cursor-pointer " +
              (isActive
                ? "bg-neutral-200 dark:bg-neutral-800 text-primary"
                : "bg-neutral-100 dark:bg-neutral-900 text-muted-foreground") +
              " backdrop-blur-xl"
            }
            aria-label={label}
            tabIndex={0}
            style={{ outline: "none" }}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </nav>
  );
};
// glassmorphism: bg-white/60 dark:bg-black/40 border border-white/40 dark:border-black/40 backdrop-blur-xl 