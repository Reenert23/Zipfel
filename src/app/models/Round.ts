import { Game } from './Game';
import { Player } from './Player';

export interface Round {
  id?: number;
  players: Player[];
  games: Game[];
  lockedPlayers?: boolean;
}

export function createEmptyRound(players: Player[] = []): Round {
  return {
    players: [...players], // wichtig: Kopie, nicht Referenz
    games: []
  };
}
