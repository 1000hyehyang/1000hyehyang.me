import { ResumeSection } from "./ResumeSection";

export function ResumeHero() {
  return (
    <ResumeSection className="mb-12" showDivider={false}>
      <h1 className="flex flex-col gap-2 font-bold tracking-tight">
        <span className="flex items-baseline gap-3">
          <span className="text-6xl font-semibold sm:text-7xl">여채현</span>
          <span className="text-2xl font-normal text-muted-foreground sm:text-3xl">
            呂採炫
          </span>
        </span>
        <span className="text-3xl text-muted-foreground sm:text-4xl">
          YEO CHAE HYEON
        </span>
        <span className="mt-2 text-xl font-light text-muted-foreground sm:text-2xl">
          Backend Engineer
        </span>
      </h1>
    </ResumeSection>
  );
}
