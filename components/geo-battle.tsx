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
  const [showHighscores, setShowHighscores] = useState(false);
  const [highscores, setHighscores] = useState<
    { userName: string; score: number }[]
  >([]);
  const MAX_ROUNDS = 2;
  const { data: session } = useSession();
  const [highscoreUpdated, setHighscoreUpdated] = useState(false);
  const [mapError, setMapError] = useState(false);

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
    setShowHighscores(true);
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
    setScoreSaved(false);
    setShowHighscores(false);
    startNewRound();
  };

  const handleMapError = () => {
    setMapError(true);
    console.error("Map failed to load properly");
  };

  return (
    <div className="w-full h-screen">
      {/* Main container with responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 h-full">
        {/* Map column - 75% on desktop (3/4 columns) */}
        <div className="md:col-span-3 flex flex-col h-full relative">
          <div className="flex-1 relative z-0 w-full">
            <div className="h-full w-full">
              <SwitzerlandMap
                onSelectPoint={handlePointSelect}
                selectedPoint={selectedPoint}
                actualCity={showResult ? currentCity : null}
                key={`map-${session?.user?.email || "guest"}-${round}`}
                onError={handleMapError}
              />
              {mapError && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Karte konnte nicht geladen werden
                    </h3>
                    <p className="mb-4">
                      Bitte versuche die Seite neu zu laden.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Seite neu laden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info column - 25% on desktop (1/4 columns) */}
        <div className="md:col-span-1 bg-main-dark1 p-4 flex flex-col overflow-y-auto text-white relative overflow-hidden border-t border-main-pink">
          {/* Gradient background effects */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
              }}
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-main-pink via-main-purple to-main-blue opacity-40"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
              }}
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-main-pink via-main-purple to-main-blue opacity-40"
            />
          </div>
          {/* Game controls - moved from below the map to the right column */}
          {!gameOver && (
            <div className="text-left mb-6">
              {!showResult ? (
                <div>
                  {currentCity && (
                    <h2 className="text-xl font-semibold mb-4 text-main-pink">
                      Wo liegt {currentCity.name}?
                    </h2>
                  )}
                  <button
                    onClick={checkAnswer}
                    disabled={!selectedPoint}
                    className="px-6 py-2 bg-main-pink text-white rounded-md w-full disabled:bg-gray-600 disabled:cursor-not-allowed transition-all hover:bg-fuchsia-800"
                  >
                    Antwort prüfen
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xl font-bold mb-2 text-main-pink">
                    Du warst {distance?.toFixed(2)} km von {currentCity?.name}{" "}
                    entfernt!
                  </div>
                  <div className="text-lg mb-4">
                    Punkte in dieser Runde:{" "}
                    {Math.max(0, Math.round(1000 - (distance || 0) * 20))}
                  </div>
                  <button
                    onClick={nextRound}
                    className="px-6 py-2 bg-main-blue text-white rounded-md w-full transition-all hover:bg-main-blueDarker2"
                  >
                    {round < MAX_ROUNDS ? "Nächste Stadt" : "Ergebnis anzeigen"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game over content - only shown at the end of the game */}
          {gameOver && (
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-4 text-main-pink">
                Spiel beendet!
              </h2>

              <h3 className="text-lg font-semibold mb-3 text-main-pink">
                Ergebnisse pro Runde
              </h3>
              <ul className="mb-4">
                {roundScores.map((score, index) => (
                  <li key={index} className="text-lg">
                    Runde {index + 1}: {score} Punkte
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-4 text-main-pink">
                Gesamtpunkte: {score}
              </h3>

              <div className="flex flex-col gap-2 mb-4">
                {!scoreSaved && (
                  <button
                    onClick={saveScore}
                    className="px-6 py-2 bg-main-pink text-white rounded-md w-full transition-all hover:bg-fuchsia-800"
                  >
                    Score speichern
                  </button>
                )}
                <button
                  onClick={restartGame}
                  className="px-6 py-2 bg-main-blue text-white rounded-md w-full transition-all hover:bg-main-blueDarker2"
                >
                  Spiel neu starten
                </button>
              </div>

              {/* Highscore list - only shown after saving the score */}
              {showHighscores && (
                <div className="mt-6">
                  <HighscoreList
                    currentUserName={session?.user?.name || "Unknown User"}
                    currentUserEmail={
                      session?.user?.email || "unknown@example.com"
                    }
                    currentUserScore={score}
                    highscoreUpdated={highscoreUpdated}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
