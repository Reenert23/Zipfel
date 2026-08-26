import { Game } from './Game';
import { Player } from './Player';

export type RoundStatus = 'ACTIVE' | 'FINISHED';

export interface Round {
  id?: number;
  players: Player[];
  games: Game[];
  lockedPlayers?: boolean;
  date: string;
  /** Fehlt, solange die Runde nur lokal gebaut und noch nicht gespeichert ist. */
  status?: RoundStatus;
  /**
   * Ob die Runde ueberhaupt einen Schreiber hat. Runden von vor der
   * Token-Einfuehrung haben keinen, und die darf niemand als Zuschauer
   * angezeigt bekommen - der Server laesst dort jeden schreiben.
   */
  writerProtected?: boolean;
}

/**
 * Antwort von POST /rounds. Das Token steckt bewusst nicht in Round selbst:
 * so kann es nicht versehentlich aus einem normalen GET mitgelesen werden.
 */
export interface RoundCreationResponse {
  round: Round;
  writerToken: string;
}

export function createEmptyRound(players: Player[] = []): Round {
  return {
    players: [...players], // wichtig: Kopie, nicht Referenz
    games: [],
    date: new Date().toISOString()
  };
}
