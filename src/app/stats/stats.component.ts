import { Component, OnInit } from '@angular/core';
import { RoundService } from '../services/round.service';
import { Round } from '../models/Round';

interface PlayerStat {
  name: string;
  playerId: number;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestGame: number;
  worstGame: number;
  solosPlayed?: number;
  solosWon?: number;
  soloWinRate?: number;
  soloPoints?: number;
}

interface GameTypeCount {
  type: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  playerStats: PlayerStat[] = [];
  gameTypeCounts: GameTypeCount[] = [];
  totalGames = 0;
  totalRounds = 0;
  loading = true;

  constructor(private roundService: RoundService) {}

  ngOnInit(): void {
    this.roundService.getAllRounds().subscribe({
      next: (rounds: Round[]) => {
        this.totalRounds = rounds.length;
        this.calcPlayerStats(rounds);
        this.calcGameTypes(rounds);
        this.loading = false;
      }
    });
  }

  private calcPlayerStats(rounds: Round[]): void {
    const map = new Map<number, PlayerStat>();

    rounds.forEach(round => {
      round.players?.forEach(player => {
        if (!map.has(player.id)) {
          map.set(player.id, {
            name: player.firstName,
            playerId: player.id,
            totalPoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            winRate: 0,
            bestGame: -Infinity,
            worstGame: Infinity,
            solosPlayed: 0,
            solosWon: 0,
            soloWinRate: 0,
            soloPoints: 0
          });
        }

        const stat = map.get(player.id)!;

        round.games?.forEach(game => {
          const score = game.scores.find(s => s.playerId === player.id);
          if (!score) return;

          stat.gamesPlayed++;
          stat.totalPoints += score.points;

          if (score.points > stat.bestGame) stat.bestGame = score.points;
          if (score.points < stat.worstGame) stat.worstGame = score.points;
          if (score.points > 0) stat.gamesWon++;

          // Solo/Geier tracking
          if ((game.gameType === 'Solo' || game.gameType === 'Geier') && game.soloCaller === player.id) {
            stat.solosPlayed!++;
            stat.soloPoints! += score.points;
            if (score.points > 0) stat.solosWon!++;
          }
        });
      });
    });

    this.playerStats = Array.from(map.values())
      .map(s => ({
        ...s,
        bestGame: s.bestGame === -Infinity ? 0 : s.bestGame,
        worstGame: s.worstGame === Infinity ? 0 : s.worstGame,
        winRate: s.gamesPlayed > 0 ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0,
        soloWinRate: s.solosPlayed! > 0 ? Math.round((s.solosWon! / s.solosPlayed!) * 100) : 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private calcGameTypes(rounds: Round[]): void {
    const counts: { [type: string]: number } = {};

    rounds.forEach(round => {
      round.games?.forEach(game => {
        const t = game.gameType || 'Unbekannt';
        counts[t] = (counts[t] || 0) + 1;
        this.totalGames++;
      });
    });

    const colorMap: { [key: string]: string } = {
      'Ruf':    'rgba(74, 222, 128, 0.8)',
      'Solo':   'rgba(96, 165, 250, 0.8)',
      'Ramsch': 'rgba(248, 113, 113, 0.8)',
      'Geier':  'rgba(250, 204, 21, 0.8)',
    };

    this.gameTypeCounts = Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      color: colorMap[type] || 'rgba(168, 85, 247, 0.8)'
    })).sort((a, b) => b.count - a.count);
  }

  getPercentage(count: number): number {
    return this.totalGames > 0 ? Math.round((count / this.totalGames) * 100) : 0;
  }
}
