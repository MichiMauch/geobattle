"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SwitzerlandMap from "./switzerland-map";
import { getRandomCity } from "@/lib/cities";
import { calculateDistance } from "@/lib/distance";
import type { City } from "@/types/game";
import HighscoreList from "@/components/highscore-list";

export default function GeoBattle() {
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
  const [showHighscoreList, setShowHighscoreList] = useState(false);
  const MAX_ROUNDS = 2;
  const { data: session } = useSession();

  // Initialize game
  useEffect(() => {
    startNewRound();
  }, []);

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

    // Berechne die Distanz zwischen dem ausgewählten Punkt und dem tatsächlichen Stadtort
    const dist = calculateDistance(
      selectedPoint[0],
      selectedPoint[1],
      currentCity.lat,
      currentCity.lng
    );

    setDistance(dist);

    // Berechne Punkte - max 1000 Punkte für perfekte Schätzung
    // Die Schweiz ist klein, daher sollte die Punkteabnahme schneller sein
    // 20 Punkte Abzug pro km, 0 Punkte bei 50km oder mehr Entfernung
    const roundScore = Math.max(0, Math.round(1000 - dist * 20));
    setScore((prev) => prev + roundScore);
    setRoundScores((prev) => [...prev, roundScore]);

    setShowResult(true);
  };

  const restartGame = () => {
    setRound(1);
    setScore(0);
    setGameOver(false);
    setRoundScores([]);
    setShowHighscoreList(false); // Reset showHighscoreList
    startNewRound();
  };

  async function saveHighscore(finalScore: number) {
    try {
      const res = await fetch("/api/highscore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score: finalScore }),
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Fehler beim Speichern des Highscores:", data.error);
      } else {
        console.log("Highscore erfolgreich gespeichert.");
      }
    } catch (error) {
      console.error("Netzwerkfehler:", error);
    }
  }

  const nextRound = () => {
    if (round < MAX_ROUNDS) {
      setRound((prev) => prev + 1);
      startNewRound();
    } else {
      setGameOver(true);
    }
  };

  const handleSaveHighscore = async () => {
    if (session && session.user) {
      await saveHighscore(score);
      setShowHighscoreList(true);
    } else {
      console.log(
        "Benutzer nicht eingeloggt. Highscore wurde nicht gespeichert."
      );
    }
  };

  // Ergebnisbildschirm
  if (gameOver) {
    return (
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Spielende!</h1>
              <p className="text-xl font-semibold text-gray-700">
                Dein Gesamtergebnis: {score} Punkte
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Punkte pro Runde:</h2>
              <div className="space-y-2">
                {roundScores.map((roundScore, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded"
                  >
                    <span>Runde {index + 1}:</span>
                    <span className="font-medium">{roundScore} Punkte</span>
                  </div>
                ))}
              </div>
            </div>

            {session && session.user && !showHighscoreList && (
              <div className="text-center mb-6">
                <button
                  onClick={handleSaveHighscore}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Highscore speichern
                </button>
              </div>
            )}

            {showHighscoreList && session && session.user && (
              <HighscoreList
                currentUserName={session.user.name || "Unknown User"}
                currentUserScore={score}
              />
            )}

            <div className="text-center">
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Neues Spiel starten
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">GeoBattle: Switzerland</h1>
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">
              Runde: {round}/{MAX_ROUNDS}
            </div>
            <div className="text-lg font-medium">Punkte: {score}</div>
          </div>
          {currentCity && !showResult && (
            <h2 className="text-xl font-semibold mt-2">
              Wo liegt {currentCity.name}?
            </h2>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <SwitzerlandMap
          onSelectPoint={handlePointSelect}
          selectedPoint={selectedPoint}
          actualCity={showResult ? currentCity : null}
        />
      </div>

      <div className="p-4 bg-white">
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
