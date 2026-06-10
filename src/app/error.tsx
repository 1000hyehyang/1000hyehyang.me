"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">문제가 발생했습니다</h1>
      <p className="text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent/10"
      >
        다시 시도
      </button>
    </section>
  );
}
