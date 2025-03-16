"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SwitzerlandMap from "./switzerland-map";
import { getRandomCity } from "@/lib/cities";
import { calculateDistance } from "@/lib/distance";
import type { City } from "@/types/game";
import HighscoreList from "@/components/highscore-list";
import { useGameContext } from "@/context/game-context";

export default function GeoBattle({
  activeDuelId,
  setActiveDuelId,
}: {
  activeDuelId: number | null;
  setActiveDuelId: (id: number | null) => void;
}) {
  const { updateRound, updateMaxRounds, updateScore } = useGameContext();
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(
    null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [highscores, setHighscores] = useState<
    { userName: string; score: number }[]
  >([]);
  const MAX_ROUNDS = 2;
  const { data: session } = useSession();
  const [highscoreUpdated, setHighscoreUpdated] = useState(false);

  useEffect(() => {
    startNewRound();
    // Initialize the context with the game's initial values
    updateMaxRounds(MAX_ROUNDS);
  }, []);

  // Update the context whenever round or score changes
  useEffect(() => {
    updateRound(round);
  }, [round, updateRound]);

  useEffect(() => {
    updateScore(score);
  }, [score, updateScore]);

  useEffect(() => {
    if (activeDuelId !== null) {
      console.log("Starte Duell mit ID:", activeDuelId);
      restartGame(); // Starte das Spiel neu mit der Herausforderung
    }
  }, [activeDuelId]);

  const startNewRound = () => {
    const city = getRandomCity();
    setCurrentCity(city);
    setSelectedPoint(null);
    setDistance(null);
    setShowResult(false);
  };

  const handlePointSelect = (latlng: [number, number]) => {
    setSelectedPoint(latlng);
  };

  const checkAnswer = () => {
    if (!selectedPoint || !currentCity) return;

    const dist = calculateDistance(
      selectedPoint[0],
      selectedPoint[1],
      currentCity.lat,
      currentCity.lng
    );

    setDistance(dist);

    const roundScore = Math.max(0, Math.round(1000 - dist * 20));
    setScore((prev) => prev + roundScore);
    setRoundScores((prev) => [...prev, roundScore]);

    setShowResult(true);
  };

  const nextRound = () => {
    if (round < MAX_ROUNDS) {
      setRound((prev) => prev + 1);
      startNewRound();
    } else {
      setGameOver(true);
      if (activeDuelId !== null) {
        handleCompleteDuel();
      }
    }
  };

  async function handleCompleteDuel() {
    if (!activeDuelId) return;

    const res = await fetch("/api/duel/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duelId: activeDuelId, opponentScore: score }),
    });

    const data = await res.json();

    if (data.success) {
      if (data.winner === "opponent") {
        alert(`Du hast gewonnen! (+${data.bonusPoints} Punkte)`);
      } else if (data.winner === "challenger") {
        alert(`Du hast leider verloren.`);
      } else {
        alert(`Unentschieden (+${data.bonusPoints} Punkte für beide!)`);
      }
    } else {
      console.error("Fehler beim Abschließen des Duells:", data.error);
    }

    setActiveDuelId(null);
  }

  const saveScore = async () => {
    if (!session?.user?.name || activeDuelId !== null) return; // Ensure userName is a string and not in a duel

    await fetch("/api/highscore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: session.user.name, score }),
    });

    setScoreSaved(true);
    // Force re-fetch of highscores
    setHighscores((prev) => [
      ...prev,
      { userName: session.user!.name as string, score },
    ]);
  };

  const restartGame = () => {
    setRound(1);
    setScore(0);
    setGameOver(false);
    setRoundScores([]);
    setShowResult(false);
    setScoreSaved(false); // Reset scoreSaved
    startNewRound();
  };

  return (
    <div className="flex flex-col h-screen relative">
      <div className="text-center">
        {currentCity && !showResult && (
          <h2 className="text-xl font-semibold">
            Wo liegt {currentCity.name}?
          </h2>
        )}
      </div>

      <div className="flex-1 relative z-0">
        <SwitzerlandMap
          onSelectPoint={handlePointSelect}
          selectedPoint={selectedPoint}
          actualCity={showResult ? currentCity : null}
        />
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="text-lg font-medium">
            Runde: {round}/{MAX_ROUNDS}
          </div>
          <div className="text-lg font-medium">Punkte: {score}</div>

          {currentCity && !showResult && (
            <h2 className="text-xl font-semibold mt-2">
              Wo liegt {currentCity.name}?
            </h2>
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Spiel beendet!</h2>

              <h3 className="text-lg font-semibold mb-3">
                Ergebnisse pro Runde
              </h3>
              <ul className="mb-4">
                {roundScores.map((score, index) => (
                  <li key={index} className="text-lg">
                    Runde {index + 1}: {score} Punkte
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold">Gesamtpunkte: {score}</h3>

              <HighscoreList
                currentUserName={session?.user?.name || "Unknown User"}
                currentUserEmail={session?.user?.email || "unknown@example.com"}
                currentUserScore={score}
                highscoreUpdated={highscoreUpdated} // Neuer Prop für Aktualisierung
              />

              {!scoreSaved && (
                <button
                  onClick={saveScore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md mt-4"
                >
                  Score speichern
                </button>
              )}
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-red-600 text-white rounded-md mt-4"
              >
                Spiel neu starten
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white z-20">
        <div className="flex flex-col items-center">
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={!selectedPoint}
              className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Antwort prüfen
            </button>
          ) : (
            <div className="text-center">
              <div className="text-xl font-bold mb-2">
                Du warst {distance?.toFixed(2)} km von {currentCity?.name}{" "}
                entfernt!
              </div>
              <div className="text-lg mb-4">
                Punkte in dieser Runde:{" "}
                {Math.max(0, Math.round(1000 - (distance || 0) * 20))}
              </div>
              <button
                onClick={nextRound}
                className="px-6 py-2 bg-green-600 text-white rounded-md"
              >
                {round < MAX_ROUNDS ? "Nächste Stadt" : "Ergebnis anzeigen"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
