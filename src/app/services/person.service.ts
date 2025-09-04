import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  //private apiUrl = 'http://localhost:8080/api/players'; // Beispiel-URL
  private apiUrl = 'http://192.168.178.169:8080/api/players'; // URL des Backends


  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }

  getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  addPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player);
  }

  updatePlayer(player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${player.id}`, player);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
