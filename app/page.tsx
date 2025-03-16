"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import GeoBattle from "@/components/geo-battle";
import OpenChallenges from "@/components/OpenChallenges";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeDuelId, setActiveDuelId] = useState<number | null>(null);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="mb-6">
        {status === "loading" && <p>Lädt...</p>}
        {/* Anmelden/Abmelden Teil entfernt */}
      </div>
      <GeoBattle
        activeDuelId={activeDuelId}
        setActiveDuelId={setActiveDuelId}
      />
    </main>
  );
}
