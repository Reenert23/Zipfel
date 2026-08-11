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

  /* axis is decided once per gesture: 'none' until the finger has moved far
     enough to tell, then 'x' for a delete swipe or 'y' for a scroll the browser
     handles on its own. Without it every scroll dragged the cards sideways,
     because a finger moving down is never perfectly vertical. */
  swipeStates: {
    distance: number;
    startX: number;
    startY: number;
    isSwiping: boolean;
    axis: 'none' | 'x' | 'y';
  }[] = [];
  readonly SWIPE_THRESHOLD = -100;
  readonly SWIPE_MAX = -350;
  /* How far the finger travels before the direction is called. Below this the
     two axes are indistinguishable and committing early gets it wrong. */
  private readonly AXIS_LOCK_PX = 8;

  constructor(private roundService: RoundService, private router: Router) {}

  ngOnInit(): void {
    this.fetchRounds();

  }


  fetchRounds(): void {
    this.roundService.getAllRounds().subscribe((data: Round[]) => {
      this.rounds = data;
      this.swipeStates = this.rounds.map(() => this.emptySwipeState());
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

  private emptySwipeState(): {
    distance: number;
    startX: number;
    startY: number;
    isSwiping: boolean;
    axis: 'none' | 'x' | 'y';
  } {
    return { distance: 0, startX: 0, startY: 0, isSwiping: false, axis: 'none' };
  }

  onSwipeStart(event: TouchEvent, index: number): void {
    const state = this.swipeStates[index];
    state.startX = event.touches[0].clientX;
    state.startY = event.touches[0].clientY;
    state.isSwiping = true;
    state.axis = 'none';
  }

  onSwipeMove(event: TouchEvent, index: number): void {
    const state = this.swipeStates[index];
    if (!state.isSwiping) return;

    const dx = event.touches[0].clientX - state.startX;
    const dy = event.touches[0].clientY - state.startY;

    if (state.axis === 'none') {
      // Too early to tell - wait rather than guess.
      if (Math.abs(dx) < this.AXIS_LOCK_PX && Math.abs(dy) < this.AXIS_LOCK_PX) return;
      state.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    // A scroll: leave it to the browser and keep the card where it is.
    if (state.axis === 'y') return;

    state.distance = Math.max(this.SWIPE_MAX - 50, Math.min(0, dx));
  }

  onSwipeEnd(event: TouchEvent, index: number): void {
    const state = this.swipeStates[index];

    // A scroll, or a tap that never moved: nothing to settle, and deleting off
    // the back of a scroll would be the worst possible outcome.
    if (state.axis !== 'x') {
      state.isSwiping = false;
      state.axis = 'none';
      return;
    }

    const distance = state.distance;

    if (distance < this.SWIPE_MAX) {
      this.deleteRound(this.rounds[index], index);
    } else if (distance < this.SWIPE_THRESHOLD) {
      state.distance = this.SWIPE_THRESHOLD;
    } else {
      state.distance = 0;
    }

    state.isSwiping = false;
    state.axis = 'none';
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

