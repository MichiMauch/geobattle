"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import GeoBattle from "@/components/geo-battle";
import OpenChallenges from "@/components/OpenChallenges";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeDuelId, setActiveDuelId] = useState<number | null>(null);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="mb-6">
        {status === "loading" && <p>Lädt...</p>}

        {session?.user ? (
          <div className="flex items-center gap-4">
            <p>
              Eingeloggt als <strong>{session.user.name}</strong>
            </p>
            <button
              className="rounded bg-red-500 text-white px-3 py-1"
              onClick={() => signOut()}
            >
              Abmelden
            </button>
          </div>
        ) : (
          <button
            className="rounded bg-blue-500 text-white px-3 py-1"
            onClick={() => signIn("google")}
          >
            Anmelden mit Google
          </button>
        )}
      </div>

      <OpenChallenges setActiveDuelId={setActiveDuelId} />
      <GeoBattle
        activeDuelId={activeDuelId}
        setActiveDuelId={setActiveDuelId}
      />
    </main>
  );
}
