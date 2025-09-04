import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Round } from '../models/Round';
import { Game } from '../models/Game';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class RoundService {
  //private baseUrl = 'http://localhost:8080/api/rounds'; // URL des Backends
  //private baseUrl = 'http://192.168.178.169:8080/api/rounds'; // URL des Backends
  private baseUrl = environment.apiUrl + "/rounds";


  constructor(private http: HttpClient) {}

  // Alle Runden laden
  getAllRounds(): Observable<Round[]> {
    return this.http.get<Round[]>(this.baseUrl);
  }

  // Runde per ID laden
  getRoundById(id: number): Observable<Round> {
    return this.http.get<Round>(`${this.baseUrl}/${id}`);
  }

  // Neue Runde anlegen
  createRound(round: Round): Observable<Round> {
    return this.http.post<Round>(this.baseUrl, round);
  }

  // Spiel zu einer Runde hinzufügen
  addGameToRound(roundId: number, game: Game): Observable<Round> {
    return this.http.post<Round>(`${this.baseUrl}/${roundId}/games`, game);
  }

  // Spiele einer Runde abrufen
  getGamesByRound(roundId: number): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/${roundId}/games`);
  }

  // Runde löschen
  deleteRound(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

