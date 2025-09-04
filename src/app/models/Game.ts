
export interface GameScore {
  playerId: number;
  points: number;
}

export interface Game {
  id?: number;              // vom Backend generiert
  gameType: string;
  soloCaller: number | null;
  scores: GameScore[];
  roundId?: number;         // optional, falls du die Beziehung brauchst
}

