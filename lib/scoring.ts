// lib/scoring.ts

/**
 * Berechnet die Punkte basierend auf der Entfernung.
 * @param distance - Entfernung in Kilometern
 * @returns Berechnete Punktzahl
 */
export function calculateScore(distance: number): number {
    return Math.max(0, Math.round(1000 - distance * 20));
  }
  