"use client";

import { useEffect, useState } from "react";

interface Highscore {
  userName: string;
  score: number;
}

interface HighscoreListProps {
  currentUserName: string;
  currentUserScore: number;
  highscoreUpdated: boolean; // Neuer Prop
}

export default function HighscoreList({
  currentUserName,
  currentUserScore,
  highscoreUpdated,
}: HighscoreListProps) {
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHighscores() {
      try {
        const res = await fetch("/api/highscore");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setHighscores(data.highscores);
      } catch (error) {
        console.error("Fehler beim Laden der Highscores:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHighscores();
  }, [currentUserScore, highscoreUpdated]); // Neuer Trigger für die Aktualisierung

  if (loading) {
    return <p>Lädt Highscores...</p>;
  }

  const currentUserIndex = highscores.findIndex(
    (highscore) =>
      highscore.userName === currentUserName &&
      highscore.score === currentUserScore
  );

  const topThreeHighscores = highscores.slice(0, 3);
  const currentUserHighscore =
    currentUserIndex >= 0 ? highscores[currentUserIndex] : null;

  return (
    <div className="text-center mb-6">
      <h2 className="text-lg font-semibold mb-3">Highscore Liste</h2>
      <div className="space-y-2">
        {topThreeHighscores.map((highscore, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gray-50 p-3 rounded"
          >
            <span>
              {index + 1}. {highscore.userName}
            </span>
            <span className="font-medium">{highscore.score} Punkte</span>
          </div>
        ))}
      </div>

      {currentUserHighscore && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Dein Platz</h3>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>
              {currentUserIndex + 1}. {currentUserHighscore.userName}
            </span>
            <span className="font-medium">
              {currentUserHighscore.score} Punkte
            </span>
          </div>
        </div>
      )}

      {!currentUserHighscore && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Dein Platz</h3>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>
              {highscores.length + 1}. {currentUserName}
            </span>
            <span className="font-medium">{currentUserScore} Punkte</span>
          </div>
        </div>
      )}
    </div>
  );
}
