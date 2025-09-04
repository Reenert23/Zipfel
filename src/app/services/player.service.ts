import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/Player';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  //private baseUrl = 'http://localhost:8080/api/player';
  private baseUrl = environment.apiUrl + "/player";


  constructor(private http: HttpClient) {}

  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.baseUrl);
  }

  createPlayer(player: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.baseUrl, player);
  }
}
