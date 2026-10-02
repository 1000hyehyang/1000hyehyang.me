import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config";

export function ResumeHero() {
  return (
    <header className="pb-12 sm:pb-16 lg:pb-20">
      <div data-scroll-reveal className="flex items-center gap-4 sm:gap-6">
        <Image
          src="/profile.png"
          alt={`${SITE_CONFIG.authorName} 프로필`}
          width={96}
          height={96}
          sizes="(max-width: 639px) 80px, 96px"
          priority
          className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
        />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {SITE_CONFIG.authorName}
          </h1>
          <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
            <span>呂採炫</span>
            <span>YEO CHAE HYEON</span>
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
            Backend Engineer
          </p>
        </div>
      </div>
      <p data-scroll-reveal className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground sm:text-sm">
        <span>#Java</span>
        <span>#SpringBoot</span>
        <span>#Backend</span>
        <span>#AX</span>
      </p>
    </header>
  );
}
