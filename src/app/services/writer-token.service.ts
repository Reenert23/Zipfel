import { Injectable } from '@angular/core';

/**
 * Das Schreibrecht an einer Runde haengt an dem Geraet, das sie angelegt hat:
 * Das Backend liefert beim Anlegen einmalig ein Token, das hier pro Runde
 * abgelegt und bei jedem Schreibzugriff mitgeschickt wird.
 *
 * Jeder Zugriff ist abgesichert, weil localStorage im Privatmodus mancher
 * Browser beim Lesen *und* Schreiben wirft, statt nur leer zu sein.
 */
const STORAGE_KEY_PREFIX = 'zipfel.writerToken.';

@Injectable({
  providedIn: 'root'
})
export class WriterTokenService {

  setToken(roundId: number, token: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + roundId, token);
    } catch {
      // Ohne Speicher bleibt nur der aktuelle Tab schreibfaehig - kein Grund,
      // die laufende Aktion abzubrechen.
    }
  }

  getToken(roundId: number): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_PREFIX + roundId);
    } catch {
      return null;
    }
  }

  clearToken(roundId: number): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + roundId);
    } catch {
      // s.o.
    }
  }
}
