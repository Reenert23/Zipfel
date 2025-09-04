import { Component, OnInit } from '@angular/core';
import { RoundService } from '../services/round.service';
import { Round , createEmptyRound} from '../models/Round';
import { Router } from '@angular/router';
import { Player } from '../models/Player';

@Component({
  selector: 'app-round-list',
  templateUrl: './round-list.component.html',
  styleUrls: ['./round-list.component.css']
})
export class RoundListComponent implements OnInit {
  rounds: Round[] = [];
  roundsDataSource: any[] = [];
  displayedColumns: string[] = [];
  allPlayersPerRound: { columnName: string; firstName: string }[] = [];

  dynamicColumns: { columnName: string; firstName: string }[] = [];
  headerColumns: string[] = ['round'];
  playerHeaderColumns: string[] = ['round'];
  playerPointsColumns: string[] = ['round'];


  constructor(private roundService: RoundService, private router: Router) {}

  ngOnInit(): void {
    this.fetchRounds();

  }


  fetchRounds(): void {
    this.roundService.getAllRounds().subscribe((data: Round[]) => {
      this.rounds = data;
      this.displayedColumns = this.getDynamicColumns();

    });
  }

  getDynamicPlayers(rounds: Round[]): string[] {
    const playerSet = new Set<string>();
    rounds.forEach((round) => {
      round.players.forEach((player) => playerSet.add(player.firstName));
    });
    return Array.from(playerSet);
  }


  getDynamicColumns(): string[] {
    const playerSet = new Set<string>();
    this.rounds.forEach((round) => {
      round.players.forEach((player) => playerSet.add(player.firstName));
    });
    return ['round', ...Array.from(playerSet)];
  }


  // Berechnet die Gesamtpunkte für einen Spieler in einer Runde
  getTotalPointsForPlayer(round: Round, player: Player): number {
    return round.games.reduce((total, game) => {
      const score = game.scores.find(s => s.playerId === player.id);
      return total + (score ? score.points : 0);
    }, 0);
  }

  neueRundeStarten(): void {
    const neueRunde = createEmptyRound(); // erstmal ohne Spieler
    this.roundService.createRound(neueRunde).subscribe({
      next: (runde) => {
        console.log('Neue Runde erstellt:', runde);
        this.rounds.push(runde);
        this.displayedColumns = this.getDynamicColumns();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen der Runde:', err);
      }
    });

  }

  goToRound(round: Round): void {
    this.router.navigate(['/rounds', round.id, 'games']);
  }


  goToGames(): void {
    this.router.navigate(['/']); // Navigiere zur Round-Seite
  }
}

