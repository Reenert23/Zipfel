import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/Game';
import { environment } from 'src/environments/environment';
import { WriterTokenService } from './writer-token.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  //private baseUrl = 'http://localhost:8080/api/games'; // URL des Backends
  //private baseUrl = 'http://192.168.178.169:8080/api/games'; // URL des Backends
  private baseUrl = environment.apiUrl + "/games";

  constructor(private http: HttpClient, private writerTokenService: WriterTokenService) {}

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/${id}`);
  }

  createGame(game: Game): Observable<Game> {
    return this.http.post<Game>(this.baseUrl, game);
  }

  // roundId muss der Aufrufer mitgeben: die URL enthaelt sie nicht, das Token
  // liegt aber pro Runde.
  deleteGame(id: number, roundId: number): Observable<void> {
    const token = this.writerTokenService.getToken(roundId);
    const options = token ? { headers: new HttpHeaders({ 'X-Writer-Token': token }) } : {};
    return this.http.delete<void>(`${this.baseUrl}/${id}`, options);
  }
}

