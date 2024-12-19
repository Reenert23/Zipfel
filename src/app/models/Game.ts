export interface PlayerPoints {
  [key: string]: number; // Key = Spielername, Value = aktuelle Punktzahl
}

export class Game {
  constructor(
    public id: number,               // Spiel-ID
    public points: PlayerPoints      // Punkte aller Spieler im Spiel
  ) {}
}
