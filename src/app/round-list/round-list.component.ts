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

  swipeStates: { distance: number; startX: number; isSwiping: boolean }[] = [];
  readonly SWIPE_THRESHOLD = -100;
  readonly SWIPE_MAX = -350;

  constructor(private roundService: RoundService, private router: Router) {}

  ngOnInit(): void {
    this.fetchRounds();

  }


  fetchRounds(): void {
    this.roundService.getAllRounds().subscribe((data: Round[]) => {
      this.rounds = data;
      this.swipeStates = this.rounds.map(() => ({ distance: 0, startX: 0, isSwiping: false }));
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
        this.goToRound(runde);
      },
      error: (err) => {
        console.error('Fehler beim Erstellen der Runde:', err);
      }
    });

  }

  onSwipeStart(event: TouchEvent, index: number): void {
    this.swipeStates[index].startX = event.touches[0].clientX;
    this.swipeStates[index].isSwiping = true;
  }

  onSwipeMove(event: TouchEvent, index: number): void {
    if (!this.swipeStates[index].isSwiping) return;

    const currentX = event.touches[0].clientX;
    let distance = currentX - this.swipeStates[index].startX;

    distance = Math.max(this.SWIPE_MAX - 50, Math.min(0, distance));
    this.swipeStates[index].distance = distance;
  }

  onSwipeEnd(event: TouchEvent, index: number): void {
    const distance = this.swipeStates[index].distance;

    if (distance < this.SWIPE_MAX) {
      this.deleteRound(this.rounds[index], index);
    } else if (distance < this.SWIPE_THRESHOLD) {
      this.swipeStates[index].distance = this.SWIPE_THRESHOLD;
    } else {
      this.swipeStates[index].distance = 0;
    }

    this.swipeStates[index].isSwiping = false;
  }

  onCardClick(round: Round, index: number): void {
    if (Math.abs(this.swipeStates[index].distance) > 50) {
      this.swipeStates[index].distance = 0;
      return;
    }
    this.goToRound(round);
  }

  deleteRound(round: Round, index: number): void {
    if (!round.id || index < 0 || index >= this.rounds.length) return;

    this.roundService.deleteRound(round.id).subscribe({
      next: () => {
        this.rounds.splice(index, 1);
        this.swipeStates.splice(index, 1);
        this.displayedColumns = this.getDynamicColumns();
      },
      error: (err) => {
        console.error('Fehler beim Löschen der Runde:', err);
        if (index < this.swipeStates.length) {
          this.swipeStates[index].distance = 0;
        }
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

