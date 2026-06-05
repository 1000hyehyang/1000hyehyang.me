import { useState, useEffect } from "react";

export const useGameOverRankPreview = (
  apiUrl: string,
  score: number,
  enabled: boolean
) => {
  const [rank, setRank] = useState<number | null>(null);
  const [inHallOfFame, setInHallOfFame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || score <= 0) {
      setRank(null);
      setInHallOfFame(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void fetch(`${apiUrl}?score=${score}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { rank?: number; inHallOfFame?: boolean } | null) => {
        if (cancelled || !data || typeof data.rank !== "number") return;
        setRank(data.rank);
        setInHallOfFame(Boolean(data.inHallOfFame));
      })
      .catch((error) => {
        console.error("순위 조회 실패:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, score, enabled]);

  return { rank, inHallOfFame, isLoading };
};
