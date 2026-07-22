"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_LINKS } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Projects" },
  { href: "/about", label: "About" },
] as const;

const navItemClassName =
  "inline-flex min-h-11 items-center justify-center px-2 text-xs font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3 sm:text-sm";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 w-full">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60] focus:not-sr-only focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        본문으로 건너뛰기
      </a>
      <div className="site-shell flex h-[var(--site-header-height)] items-center justify-end">
        <nav aria-label="주요 메뉴" className="flex items-center gap-0.5 sm:gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`${navItemClassName} ${
                  isActive
                    ? "font-semibold text-brand"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <a
            href={SITE_LINKS.blog}
            target="_blank"
            rel="noopener noreferrer"
            className={`${navItemClassName} text-muted-foreground`}
          >
            Blog
          </a>
        </nav>

        <div className="ml-0.5 sm:ml-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
