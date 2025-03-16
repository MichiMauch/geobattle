"use client";

import { useEffect, useState } from "react";

interface Highscore {
  userName: string;
  score: number;
}

interface HighscoreListProps {
  currentUserName: string;
  currentUserEmail: string;
  currentUserScore: number;
  highscoreUpdated: boolean; // Neuer Prop
}

export default function HighscoreList({
  currentUserName,
  currentUserEmail,
  currentUserScore,
  highscoreUpdated,
}: HighscoreListProps) {
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [loading, setLoading] = useState(true);
  const [opponentEmail, setOpponentEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

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

  // Highscores nach Punkten sortieren (höchste zuerst)
  const sortedHighscores = [
    ...highscores,
    { userName: currentUserName, score: currentUserScore },
  ].sort((a, b) => b.score - a.score);

  // Aktuelle Platzierung des Users in der sortierten Liste
  const currentUserIndex = sortedHighscores.findIndex(
    (highscore) =>
      highscore.userName === currentUserName &&
      highscore.score === currentUserScore
  );

  const actualRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;

  const topThreeHighscores = sortedHighscores.slice(0, 3);
  const currentUserHighscore =
    currentUserIndex >= 0 ? sortedHighscores[currentUserIndex] : null;

  async function handleChallengeSubmit() {
    if (!opponentEmail) {
      setMessage("Bitte eine gültige E-Mail eingeben.");
      return;
    }

    try {
      const payload = {
        challengerUserId: currentUserEmail, // Korrekte E-Mail als ID
        challengerUserName: currentUserName, // Name des Herausforderers
        challengerScore: currentUserScore, // Punktestand
        opponentUserId: opponentEmail, // E-Mail des Gegners
        opponentUserName: "Unbekannt", // Falls nicht verfügbar, einen Standardwert setzen
      };

      console.log("Sende Herausforderung an API mit Daten:", payload);

      const response = await fetch("/api/duel/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage("Herausforderung erfolgreich gesendet!");
      setOpponentEmail(""); // Reset nach erfolgreicher Eingabe
      setShowChallengeForm(false);
    } catch (error) {
      console.error("Fehler beim Senden der Herausforderung:", error);
      setMessage("Fehler beim Speichern. Bitte erneut versuchen.");
    }
  }

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
          <h3 className="text-lg font-semibold mb-3">Dein Platzz</h3>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>
              {actualRank}. {currentUserHighscore.userName}
            </span>
            <span className="font-medium">
              {currentUserHighscore.score} Punkte
            </span>
          </div>
        </div>
      )}

      {/* Herausforderung senden (nur anzeigen, wenn ein Score existiert) */}
      {currentUserScore > 0 && (
        <div className="mt-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setShowChallengeForm(true)}
          >
            Jemanden herausfordern
          </button>
        </div>
      )}

      {showChallengeForm && (
        <div className="mt-4">
          <input
            type="email"
            value={opponentEmail}
            onChange={(e) => setOpponentEmail(e.target.value)}
            placeholder="E-Mail des Gegners"
            className="border p-2 rounded w-full mb-2"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
            onClick={handleChallengeSubmit}
          >
            Herausforderung senden
          </button>
          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
        </div>
      )}
    </div>
  );
}
