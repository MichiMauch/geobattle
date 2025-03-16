"use client";
import { X } from "lucide-react";

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Overlay({
  isOpen,
  onClose,
  title,
  children,
}: OverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-main-dark1 text-white rounded-lg p-6 max-w-md w-full relative border border-main-pink shadow-lg">
        {/* Hintergrund-Effekt */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-main-pink via-main-purple to-main-blue opacity-40"
          />
        </div>

        {/* Schließen-Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Schließen"
        >
          <X size={20} />
        </button>

        {/* Titel */}
        <h3 className="text-xl font-bold mb-4 text-main-pink">{title}</h3>

        {/* Inhalt */}
        {children}
      </div>
    </div>
  );
}
