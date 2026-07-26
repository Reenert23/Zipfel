
export interface GameScore {
  playerId: number;
  points: number;
}

export interface Game {
  id?: number;
  gameType: string;
  soloCaller: number | null;
  scores: GameScore[];
  roundId?: number;
  tout?: boolean;
  schneider?: boolean;
  schwarz?: boolean;
}

