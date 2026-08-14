import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Round } from '../models/Round';
import { Game } from '../models/Game';
import { environment } from 'src/environments/environment';

/**
 * Spiele nach id, also nach Anlagereihenfolge: die id ist im Backend eine
 * IDENTITY-Spalte, die Postgres beim INSERT vergibt.
 *
 * Ein Spiel ohne id ist lokal gebaut und noch nicht gespeichert, gehoert also
 * ans Ende - deshalb Infinity statt 0, sonst wanderte es an den Anfang.
 */
function byGameId(a: Game, b: Game): number {
  return (a.id ?? Infinity) - (b.id ?? Infinity);
}

/**
 * Die Reihenfolge der Spiele traegt im Frontend Bedeutung, an drei Stellen:
 * die Tabelle und das Verlaufsdiagramm nummerieren nach Array-Position, und
 * "Letztes Spiel rueckgaengig" nimmt schlicht das letzte Element.
 *
 * Das Backend hat sie lange nicht garantiert (Round.games ohne @OrderBy), und
 * ohne ORDER BY verschiebt Postgres die Zeilen beim Einfuegen. Der Fix sitzt
 * dort, aber er wirkt erst nach dem Deploy und nur gegen diesen einen Server -
 * hier wird deshalb unabhaengig davon sortiert.
 *
 * Kopie statt sort() auf dem Original: die Antwort gehoert dem HttpClient.
 */
function withSortedGames(round: Round): Round {
  if (!round?.games?.length) {
    return round;
  }
  return { ...round, games: [...round.games].sort(byGameId) };
}

@Injectable({
  providedIn: 'root'
})
export class RoundService {
  //private baseUrl = 'http://localhost:8080/api/rounds'; // URL des Backends
  //private baseUrl = 'http://192.168.178.169:8080/api/rounds'; // URL des Backends
  private baseUrl = environment.apiUrl + "/rounds";

  private currentRoundId: number = 0;


  constructor(private http: HttpClient) {}

  // Alle Runden laden
  getAllRounds(): Observable<Round[]> {
    return this.http.get<Round[]>(this.baseUrl).pipe(
      map(rounds => rounds.map(withSortedGames))
    );
  }

  // Runde per ID laden
  getRoundById(id: number): Observable<Round> {
    return this.http.get<Round>(`${this.baseUrl}/${id}`).pipe(map(withSortedGames));
  }

  // Neue Runde anlegen
  createRound(round: Round): Observable<Round> {
    return this.http.post<Round>(this.baseUrl, round);
  }

  // Spiel zu einer Runde hinzufügen
  addGameToRound(roundId: number, game: Game): Observable<Round> {
    return this.http.post<Round>(`${this.baseUrl}/${roundId}/games`, game).pipe(
      map(withSortedGames)
    );
  }

  // Spiele einer Runde abrufen
  getGamesByRound(roundId: number): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/${roundId}/games`).pipe(
      map(games => [...games].sort(byGameId))
    );
  }

  // Runde löschen
  deleteRound(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  setCurrentRoundId(id: number): void {
    this.currentRoundId = id;
  }

  getCurrentRoundId(): number {
    return this.currentRoundId;
  }

  clearCurrentRoundId(): void {
    this.currentRoundId = 0;
  }
}

