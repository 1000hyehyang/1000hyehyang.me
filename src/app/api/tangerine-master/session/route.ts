import { handleGameSessionPost } from "@/lib/game-leaderboard-api";

export async function POST(request: Request) {
  return handleGameSessionPost(request, "master");
}
