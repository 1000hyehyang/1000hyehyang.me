"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, PenTool, Archive, Citrus, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { NavItem } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/blog", icon: PenTool, label: "블로그" },
  { href: "/portfolio", icon: Archive, label: "프로젝트" },
  { href: "/game", icon: Gamepad2, label: "놀이터" },
  { href: "/about", icon: Citrus, label: "소개" },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const handleNavFocus = (href: string) => {
    setFocusedItem(href);
  };

  const handleNavBlur = () => {
    setFocusedItem(null);
  };

  return (
    <nav
      className="fixed bottom-4 inset-x-0 mx-auto z-50 flex gap-1 w-fit"
      aria-label="하단 네비게이션"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        // 홈 경로는 정확히 일치해야 하고, 다른 경로는 해당 경로로 시작하면 활성화
        const isActive = 
          href === "/" 
            ? pathname === href || focusedItem === href
            : (pathname.startsWith(href) || focusedItem === href);
        
        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleNavClick(href)}
                onFocus={() => handleNavFocus(href)}
                onBlur={handleNavBlur}
                className={
                  "flex items-center justify-center p-3 rounded-lg transition-colors duration-200 select-none hover:cursor-pointer " +
                  (isActive
                    ? "bg-white dark:bg-black text-orange-300 border border-white dark:border-black"
                    : "bg-white dark:bg-black text-muted-foreground border border-white dark:border-black")
                }
                aria-label={label}
                tabIndex={0}
                style={{ outline: "none" }}
              >
                <Icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-popover text-popover-foreground border border-border shadow-none"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}; 