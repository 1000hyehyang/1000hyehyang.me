export interface GameLeaderboardEntry {
  score: number;
  timestamp: string;
  playerName?: string;
}

const XSS_PATTERN = /[<>]/g;
const JS_PROTOCOL = /javascript:/gi;
const EVENT_HANDLER = /on\w+=/gi;

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
