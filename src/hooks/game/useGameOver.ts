import { useState } from "react";

export const useGameOver = () => {
  const [showGameOver, setShowGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [originalHighScore, setOriginalHighScore] = useState(0);

  const handleGameOverClose = () => {
    setShowGameOver(false);
    setPlayerName("");
    setOriginalHighScore(0);
  };

  return {
    showGameOver,
    setShowGameOver,
    playerName,
    setPlayerName,
    originalHighScore,
    setOriginalHighScore,
    handleGameOverClose,
  };
};
