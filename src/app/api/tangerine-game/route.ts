import {
  handleGameLeaderboardGet,
  handleGameScorePost,
  TANGERINE_SCORE_CONFIG,
} from "@/lib/game-leaderboard-api";

export async function GET(request: Request) {
  return handleGameLeaderboardGet(request, TANGERINE_SCORE_CONFIG);
}

export async function POST(request: Request) {
  return handleGameScorePost(request, TANGERINE_SCORE_CONFIG);
}
