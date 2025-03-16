"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { GameProvider } from "@/context/game-context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GameProvider>{children}</GameProvider>
    </SessionProvider>
  );
}
