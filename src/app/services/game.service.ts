import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/Game';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  //private baseUrl = 'http://localhost:8080/api/games'; // URL des Backends
  //private baseUrl = 'http://192.168.178.169:8080/api/games'; // URL des Backends
  private baseUrl = environment.apiUrl + "/games";

  constructor(private http: HttpClient) {}

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/${id}`);
  }

  createGame(game: Game): Observable<Game> {
    return this.http.post<Game>(this.baseUrl, game);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

