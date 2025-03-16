"use client";

import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";

interface OpenChallengesProps {
  setActiveDuelId: (id: number) => void;
}

export default function OpenChallenges({
  setActiveDuelId,
}: OpenChallengesProps) {
  const [duels, setDuels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpenDuels() {
      try {
        const res = await fetch("/api/duel/duels");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setDuels(data.duels || []); // Fallback auf leeres Array
      } catch (error) {
        console.error("Fehler beim Laden der Duelle:", error);
        setDuels([]); // Falls Fehler auftritt, leeres Array setzen
      } finally {
        setLoading(false);
      }
    }

    fetchOpenDuels();
  }, []);

  if (loading)
    return <p className="text-gray-500">Lade Herausforderungen...</p>;
  if (!duels?.length)
    return <p className="text-gray-500">Keine offenen Herausforderungen.</p>;

  return (
    <div className="space-y-2">
      {duels.length === 0 ? (
        <p className="text-gray-500">Keine offenen Herausforderungen.</p>
      ) : (
        <ul className="space-y-2">
          {duels.map((duel) => (
            <li
              key={duel.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
            >
              <span className="font-medium mr-4">
                {duel.challengerUserName} - {duel.challengerScore} Punkte
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptChallenge(duel.id)}
                  className="text-primary"
                >
                  <FaCircleCheck className="h-6 w-6" />
                </button>
                <button
                  onClick={() => declineChallenge(duel.id)}
                  className="text-geobattle"
                >
                  <TiDelete className="h-9 w-9" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  function acceptChallenge(duelId: number) {
    setActiveDuelId(duelId);
  }

  function declineChallenge(duelId: number) {
    // Platzhalterfunktion für das Ablehnen einer Herausforderung
    console.log(`Duel ${duelId} declined`);
  }
}
