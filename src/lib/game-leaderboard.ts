/** 리더보드 API·UI에서 공통으로 쓰는 엔트리 형태 */
export interface GameLeaderboardEntry {
  score: number;
  timestamp: string;
  playerName?: string;
}

const XSS_PATTERN = /[<>]/g;
const JS_PROTOCOL = /javascript:/gi;
const EVENT_HANDLER = /on\w+=/gi;

/** 리더보드에 표시할 플레이어명 정리 (XSS 완화) */
export function sanitizeLeaderboardPlayerName(
  text: string,
  options?: { maxLength?: number }
): string {
  let s = text
    .replace(XSS_PATTERN, "")
    .replace(JS_PROTOCOL, "")
    .replace(EVENT_HANDLER, "")
    .trim();
  if (options?.maxLength != null) {
    s = s.slice(0, options.maxLength);
  }
  return s;
}

export function formatLeaderboardDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 생존 시간(초) → MM:SS */
export function formatSurvivalTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function medalEmoji(rankIndex: number): string {
  if (rankIndex === 0) return "🥇";
  if (rankIndex === 1) return "🥈";
  if (rankIndex === 2) return "🥉";
  return "";
}
