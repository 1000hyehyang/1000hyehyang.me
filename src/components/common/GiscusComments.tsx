"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 전까지만 대기
  if (!mounted) {
    return (
      <div className="mt-8 p-4 text-center text-muted-foreground">
        댓글 로딩 중...
      </div>
    );
  }

  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="mt-8">
      <Giscus
        key={giscusTheme}
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
        theme={giscusTheme}
        lang="ko"
        loading="eager"
      />
    </div>
  );
}; 