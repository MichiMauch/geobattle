"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useGameContext } from "@/context/game-context";

export default function SubHeader() {
  const { round, maxRounds, score } = useGameContext();

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-main-dark1 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-main-gradientStart to-main-gradientEnd opacity-40"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-main-gradientStart to-main-gradientEnd opacity-40"
        />
      </div>
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
        <svg
          viewBox="0 0 2 2"
          aria-hidden="true"
          className="mx-2 inline size-0.5 fill-current"
        >
          <circle r={1} cx={1} cy={1} />
        </svg>
        Punkte: {score}
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
