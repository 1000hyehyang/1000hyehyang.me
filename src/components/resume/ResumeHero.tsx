import { SITE_CONFIG } from "@/lib/config";

export function ResumeHero() {
  return (
    <header className="pb-12 sm:pb-16 lg:pb-20">
      <p data-scroll-reveal className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-brand">
        {SITE_CONFIG.title} · Portfolio
      </p>
      <h1 data-scroll-reveal className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
        Backend Engineer<span className="text-brand">.</span>
      </h1>
      <p data-scroll-reveal className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xl font-semibold sm:text-2xl">{SITE_CONFIG.authorName}</span>
        <span className="text-sm text-muted-foreground">呂採炫 · YEO CHAE HYEON</span>
      </p>
    </header>
  );
}
