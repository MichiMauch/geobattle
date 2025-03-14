"use client";

import { useEffect, useState } from "react";

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
      const res = await fetch("/api/duel/duels");
      const data = await res.json();
      setDuels(data.duels);
      setLoading(false);
    }

    fetchOpenDuels();
  }, []);

  if (loading) return <p>Lade...</p>;
  if (!duels.length) return <p>Keine offenen Herausforderungen.</p>;

  return (
    <div className="bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-2">Offene Herausforderungen:</h2>
      <ul className="space-y-2">
        {duels.map((duel) => (
          <li key={duel.id} className="flex justify-between items-center">
            <span>
              {duel.challengerUserName} ({duel.challengerScore} Punkte)
            </span>
            <button
              onClick={() => acceptChallenge(duel.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Herausforderung annehmen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  function acceptChallenge(duelId: number) {
    setActiveDuelId(duelId);
  }
}
