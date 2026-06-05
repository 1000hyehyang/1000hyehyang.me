import {
  handleGameLeaderboardGet,
  handleGameScorePost,
  MASTER_SCORE_CONFIG,
} from "@/lib/game-leaderboard-api";

export async function GET(request: Request) {
  return handleGameLeaderboardGet(request, MASTER_SCORE_CONFIG);
}

export async function POST(request: Request) {
  return handleGameScorePost(request, MASTER_SCORE_CONFIG);
}
