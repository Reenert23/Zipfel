import { GameScore } from '../models/Game';

/**
 * Ein Spiel verschiebt Geld, es erzeugt keines und vernichtet keines. Die
 * Summe über alle Spieler muss deshalb 0 sein.
 *
 * Alle Beträge sind Cent, so wie sie eingegeben werden - die Werte in den
 * Spielen sind bereits Geldbeträge und keine abstrakten Punkte (siehe README).
 */

/**
 * Was von einem Spiel übrig bleibt, wenn man alle Beträge addiert. 0 heißt,
 * das Spiel geht auf. Alles andere ist ein Eingabe- oder Rechenfehler und
 * taucht am Ende des Abends im Kassensturz wieder auf, wenn niemand mehr
 * weiß, welches Spiel es war.
 */
export function imbalance(scores: GameScore[]): number {
  return scores.reduce((sum, score) => sum + score.points, 0);
}

export function isZeroSum(scores: GameScore[]): boolean {
  return imbalance(scores) === 0;
}

/**
 * Teilt einen Betrag auf mehrere Zahler auf, ohne dass etwas verlorengeht.
 *
 * Nötig beim Solo: Der Betrag des Alleinspielers wird von den drei anderen
 * getragen, und ein durch drei nicht teilbarer Betrag lässt sich nicht auf
 * drei gleiche Teile bringen. Wird je Spieler abgerundet, verschwinden ein
 * bis zwei Cent aus der Runde - bei 80 Cent zahlen drei Gegenspieler je 26,
 * zusammen 78 statt 80.
 *
 * Der Rest wird deshalb auf die ersten Teile verteilt: aus 80 werden 27, 27
 * und 26. Die Teile unterscheiden sich um höchstens einen Cent, und ihre
 * Summe trifft den Betrag genau.
 */
export function distribute(total: number, parts: number): number[] {
  if (parts <= 0) {
    return [];
  }

  const sign = total < 0 ? -1 : 1;
  const amount = Math.abs(total);
  const base = Math.floor(amount / parts);
  const remainder = amount - base * parts;

  return Array.from({ length: parts }, (_, index) =>
    sign * (base + (index < remainder ? 1 : 0))
  );
}
