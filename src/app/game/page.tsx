import { GameList } from "@/components/game/GameList";

export default function GamePage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">
          Playground.
        </h1>
        <p className="text-muted-foreground">
          우리 함께 놀아요!
        </p>
      </div>

      <GameList />
    </div>
  );
}
