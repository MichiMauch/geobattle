"use client";
import { signIn } from "next-auth/react";
import Overlay from "./Overlay"; // Import der neuen Overlay-Komponente

interface LoginOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginOverlay({
  isOpen,
  onClose,
  message = "Du musst eingeloggt sein, um deinen Score zu speichern.",
}: LoginOverlayProps) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} title="Anmeldung erforderlich">
      <p className="mb-6">{message}</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            signIn(undefined, { callbackUrl: window.location.href })
          }
          className="px-6 py-2 bg-main-pink text-white rounded-md w-full transition-all hover:bg-fuchsia-800"
        >
          Jetzt anmelden
        </button>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-transparent border border-main-blue text-white rounded-md w-full transition-all hover:bg-main-blue/20"
        >
          Abbrechen
        </button>
      </div>
    </Overlay>
  );
}
