import { Injectable } from '@angular/core';

/**
 * "Wer bin ich an diesem Tisch?" - die Wahl eines Mitlesers, fuer welchen
 * Spieler er die Runde verfolgt.
 *
 * Pro Runde gespeichert, nicht global: die Besetzung wechselt von Abend zu
 * Abend, und bei bis zu zehn Leuten in wechselnden Vierer-Konstellationen
 * waere eine einmal global gemerkte Zuordnung beim naechsten Mal schlicht
 * falsch.
 *
 * Wie beim Schreiber-Token ist jeder Zugriff abgesichert - localStorage wirft
 * im Privatmodus mancher Browser, statt nur leer zu sein.
 */
const STORAGE_KEY_PREFIX = 'zipfel.mitlesenSpieler.';

@Injectable({
  providedIn: 'root'
})
export class SpectatorChoiceService {

  setPlayer(roundId: number, playerId: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + roundId, String(playerId));
    } catch {
      // Ohne Speicher gilt die Wahl nur fuer diesen Besuch.
    }
  }

  getPlayer(roundId: number): number | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + roundId);
      if (raw === null) {
        return null;
      }
      const id = Number(raw);
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  }

  clearPlayer(roundId: number): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + roundId);
    } catch {
      // s.o.
    }
  }
}
