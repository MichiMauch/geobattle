"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type GameContextType = {
  round: number;
  maxRounds: number;
  score: number;
  updateRound: (round: number) => void;
  updateMaxRounds: (maxRounds: number) => void;
  updateScore: (score: number) => void;
};

const defaultContext: GameContextType = {
  round: 1,
  maxRounds: 2,
  score: 0,
  updateRound: () => {},
  updateMaxRounds: () => {},
  updateScore: () => {},
};

const GameContext = createContext<GameContextType>(defaultContext);

export const useGameContext = () => useContext(GameContext);

export function GameProvider({ children }: { children: ReactNode }) {
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(2);
  const [score, setScore] = useState(0);

  const updateRound = (newRound: number) => {
    setRound(newRound);
  };

  const updateMaxRounds = (newMaxRounds: number) => {
    setMaxRounds(newMaxRounds);
  };

  const updateScore = (newScore: number) => {
    setScore(newScore);
  };

  return (
    <GameContext.Provider
      value={{
        round,
        maxRounds,
        score,
        updateRound,
        updateMaxRounds,
        updateScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
