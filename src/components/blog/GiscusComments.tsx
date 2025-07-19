"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { GISCUS_CONFIG } from "@/lib/config";

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center text-muted-foreground">댓글 로딩 중...</div>
});

export const GiscusComments = () => {
  const { theme } = useTheme();

  return (
    <div className="mt-8">
      <Giscus
        id="comments"
        repo={GISCUS_CONFIG.repo as `${string}/${string}`}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "dark" : "light"}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}; 