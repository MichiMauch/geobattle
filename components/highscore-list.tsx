"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Overlay from "./Overlay"; // Add this import

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
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [lastChallengedEmail, setLastChallengedEmail] = useState("");

  useEffect(() => {
    async function fetchHighscores() {
      try {
        const res = await fetch("/api/highscore");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, message: ${errorText}`
          );
        }
        const data = await res.json();
        setHighscores(data.highscores);
      } catch (error) {
        console.error("Fehler beim Laden der Highscores:", error);
        if (
          error instanceof Error &&
          error.message.includes("Database error")
        ) {
          setMessage("Datenbankfehler: Bitte versuchen Sie es später erneut.");
        } else if (error instanceof Error && error.message.includes("404")) {
          setMessage("API-Route nicht gefunden: Bitte überprüfen Sie die URL.");
        } else {
          setMessage("Ein unbekannter Fehler ist aufgetreten.");
        }
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

    setIsSubmitting(true);
    setMessage(null);

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
      setLastChallengedEmail(opponentEmail); // Save the email for the overlay
      setShowSuccessOverlay(true); // Show the overlay
      setOpponentEmail(""); // Reset nach erfolgreicher Eingabe
      setShowChallengeForm(false);
      setChallengeSent(true); // Set challenge as sent
    } catch (error) {
      console.error("Fehler beim Senden der Herausforderung:", error);
      setMessage("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const closeSuccessOverlay = () => {
    setShowSuccessOverlay(false);
  };

  const closeChallengeForm = () => {
    setShowChallengeForm(false);
    setMessage(null);
    setOpponentEmail("");
  };

  return (
    <div className="text-center mb-6">
      {/* Herausforderung senden (nur anzeigen, wenn ein Score existiert) */}
      {currentUserScore > 0 && (
        <div className="mb-6">
          <button
            className={`px-4 py-2 w-full rounded ${
              challengeSent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-main-pink hover:bg-fuchsia-800"
            } text-white`}
            onClick={() => setShowChallengeForm(true)}
            disabled={challengeSent}
          >
            {challengeSent
              ? "Herausforderung bereits gesendet"
              : "Jemanden herausfordern"}
          </button>
        </div>
      )}

      {/* Dein Platz - jetzt vor der Rangliste */}
      {currentUserHighscore && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Dein Platz</h3>
          <div className="text-fuchsia-600 flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>
              {actualRank}. {currentUserHighscore.userName}
            </span>
            <span className="font-medium">
              {currentUserHighscore.score} Punkte
            </span>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Highscore Liste</h2>
      <div className="space-y-2">
        {topThreeHighscores.map((highscore, index) => (
          <div
            key={index}
            className="text-fuchsia-600 flex justify-between items-center bg-gray-50 p-3 rounded"
          >
            <span>
              {index + 1}. {highscore.userName}
            </span>
            <span className="font-medium">{highscore.score} Punkte</span>
          </div>
        ))}
      </div>

      {/* Challenge Form Overlay */}
      <Overlay
        isOpen={showChallengeForm}
        onClose={closeChallengeForm}
        title="Spieler herausfordern"
      >
        <p className="mb-4">
          Gib die E-Mail-Adresse des Spielers ein, den du herausfordern
          möchtest.
        </p>

        <div className="mb-4">
          <input
            type="email"
            value={opponentEmail}
            onChange={(e) => setOpponentEmail(e.target.value)}
            placeholder="E-Mail des Gegners"
            className="border p-2 rounded w-full mb-2 bg-gray-800 border-gray-700 text-white"
            disabled={isSubmitting}
          />
          {message && <p className="mt-2 text-sm text-red-400">{message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleChallengeSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-main-pink text-white rounded-md w-full transition-all hover:bg-fuchsia-800 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Herausforderung senden"
            )}
          </button>

          <button
            onClick={closeChallengeForm}
            className="px-6 py-2 bg-transparent border border-main-blue text-white rounded-md w-full transition-all hover:bg-main-blue/20"
          >
            Abbrechen
          </button>
        </div>
      </Overlay>

      {/* Success Overlay */}
      <Overlay
        isOpen={showSuccessOverlay}
        onClose={closeSuccessOverlay}
        title="Herausforderung gesendet!"
      >
        <p className="mb-6">
          Eine E-Mail wurde an{" "}
          <span className="font-semibold">{lastChallengedEmail}</span>{" "}
          verschickt.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={closeSuccessOverlay}
            className="px-6 py-2 bg-main-pink text-white rounded-md w-full transition-all hover:bg-fuchsia-800"
          >
            Verstanden
          </button>
        </div>
      </Overlay>
    </div>
  );
}
