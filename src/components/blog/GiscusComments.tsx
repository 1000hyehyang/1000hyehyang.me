"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center text-muted-foreground">댓글 로딩 중...</div>
});

const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO! as `${string}/${string}`;
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID!;
const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY!;
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!;

export const GiscusComments = () => {
  const { theme } = useTheme();

  return (
    <Giscus
      id="comments"
      repo={GISCUS_REPO}
      repoId={GISCUS_REPO_ID}
      category={GISCUS_CATEGORY}
      categoryId={GISCUS_CATEGORY_ID}
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === "dark" ? "dark" : "light"}
      lang="ko"
      loading="lazy"
    />
  );
}; 