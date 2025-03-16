"use client";
import { useGameContext } from "@/context/game-context";

export default function SubHeader() {
  const { round, maxRounds, score } = useGameContext();

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-main-dark1 via-main-purple to-main-dark1 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 border-t border-main-pink">
      <p className="text-sm/6 text-main-pink">
        <strong className="font-semibold">Version Schweiz</strong>
        <svg
          viewBox="0 0 2 2"
          aria-hidden="true"
          className="mx-2 inline size-0.5 fill-current"
        >
          <circle r={1} cx={1} cy={1} />
        </svg>
        Runde {round} von {maxRounds}&nbsp;
      </p>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
        >
          <span className="sr-only">Dismiss</span>&nbsp;
        </button>
      </div>
    </div>
  );
}
