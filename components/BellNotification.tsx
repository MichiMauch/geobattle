"use client";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OpenChallenges from "@/components/OpenChallenges";
import { useEffect, useState } from "react";

interface BellNotificationProps {
  setActiveDuelId: (id: number) => void;
}

export default function BellNotification({
  setActiveDuelId,
}: BellNotificationProps) {
  const [duelCount, setDuelCount] = useState(0);

  useEffect(() => {
    async function fetchDuelCount() {
      try {
        const res = await fetch("/api/duel/duels");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, message: ${errorText}`
          );
        }

        const data = await res.json();
        setDuelCount(data.duels?.length || 0);
      } catch (error) {
        console.error("Fehler beim Laden der Duelle:", error);
        setDuelCount(0);
      }
    }

    fetchDuelCount();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative w-8 h-8">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary cursor-pointer hover:bg-fuchsia-800 transition-colors">
            <BellIcon className="w-6 h-6 text-white" />
            {duelCount > 0 && (
              <span className="absolute top-[-7px] right-[-7px] block h-4 w-4 rounded-full bg-red-500 text-white text-xs leading-tight text-center">
                {duelCount}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-semibold mb-2">Herausforderungen</h2>
          <OpenChallenges
            setActiveDuelId={(id) => {
              setActiveDuelId(id);
              // Close the dropdown after selecting a challenge
              document.body.click();
            }}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
