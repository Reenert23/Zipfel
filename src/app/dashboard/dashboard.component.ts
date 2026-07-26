import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoundService } from '../services/round.service';
import { Round } from '../models/Round';

interface PlayerStats {
  id: number;
  name: string;
  wins: number;
  gamesPlayed: number;
  totalPoints: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  rounds: Round[] = [];
  playerStats: PlayerStats[] = [];
  totalRounds = 0;

  constructor(
    private roundService: RoundService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRounds();
  }

  loadRounds(): void {
    this.roundService.getAllRounds().subscribe({
      next: (rounds: Round[]) => {
        this.rounds = rounds.sort((a: Round, b: Round) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);

        this.totalRounds = rounds.length;
        this.calculateStats(rounds);
      }
    });
  }

  calculateStats(rounds: Round[]): void {
    const statsMap = new Map<number, PlayerStats>();

    rounds.forEach(round => {
      if (!round.games || round.games.length === 0) return;

      round.players?.forEach(player => {
        if (!statsMap.has(player.id)) {
          statsMap.set(player.id, {
            id: player.id,
            name: player.firstName,
            wins: 0,
            gamesPlayed: 0,
            totalPoints: 0
          });
        }

        const stats = statsMap.get(player.id)!;
        stats.gamesPlayed += round.games.length;

        const playerPoints = round.games.reduce((sum, game) => {
          const score = game.scores.find(s => s.playerId === player.id);
          return sum + (score?.points || 0);
        }, 0);

        stats.totalPoints += playerPoints;

        const wins = round.games.filter(game => {
          const score = game.scores.find(s => s.playerId === player.id);
          return score && score.points > 0 &&
            game.scores.every(s => s.points <= score.points);
        }).length;

        stats.wins += wins;
      });
    });

    this.playerStats = Array.from(statsMap.values())
      .sort((a, b) => b.wins - a.wins);
  }

  startNewRound(): void {
    this.router.navigate(['/play']);
  }

  openRound(roundId?: number): void {
    if (roundId) {
      this.router.navigate([`/rounds/${roundId}/games`]);
    }
  }

  goToRounds(): void {
    this.router.navigate(['/rounds']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
