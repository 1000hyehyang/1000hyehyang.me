"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center text-muted-foreground">댓글 로딩 중...</div>
});

export const GiscusComments = ({
  repo,
  repoId,
  category,
  categoryId,
  term,
}: {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  term: string;
}) => {
  const { theme } = useTheme();

  // theme가 확정될 때까지 Giscus 렌더링하지 않음
  if (!theme) return null;

  return (
    <div className="mt-8">
      <Giscus
        key={theme}
        id="comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="title"
        term={term}
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