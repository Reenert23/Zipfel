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

  /**
   * Laeuft die Runde noch? Der Server liefert fuer Altdaten ohne Status
   * ACTIVE nach, geprueft wird trotzdem auf FINISHED - ein fehlender Status
   * soll eine laufende Runde nicht stillegen.
   */
  istLive(round: Round): boolean {
    return round.status !== 'FINISHED';
  }

  /**
   * writerProtected beantwortet das schon vollstaendig: es ist nur wahr, wenn
   * die Runde einen Schreiber hat *und* das Mitlesen nicht abgeschaltet wurde.
   * Alte Runden ohne Schreiber zaehlen damit als "aus" - dort darf ohnehin
   * jeder eintragen, also verhaelt sich die Runde genau so.
   */
  istMitlesenAktiv(round: Round): boolean {
    return round.writerProtected === true;
  }

  private readonly RANK_MEDALS = ['🥇', '🥈', '🥉'];

  /**
   * Medaille fuer die Top 3 Punktestaende der Runde - nach Rang, nicht nach
   * Sitzplatz. Gleichstand teilt sich eine Medaille (Standard-Ranking:
   * 660, 660, 240 -> Gold, Gold, Bronze), damit niemand durch einen Gleichstand
   * eine bessere Medaille bekommt als tatsaechlich verdient.
   */
  getMedalForPlayer(round: Round, player: Player): string | null {
    if (!round.games.length) return null;

    const distinctTotals = Array.from(
      new Set(round.players.map(p => this.getTotalPointsForPlayer(round, p)))
    ).sort((a, b) => b - a);

    const rank = distinctTotals.indexOf(this.getTotalPointsForPlayer(round, player));
    return rank >= 0 && rank < this.RANK_MEDALS.length ? this.RANK_MEDALS[rank] : null;
  }

  /**
   * Der groesste Einzelgewinn eines Spiels in der Runde - der Betrag, den
   * jemand an diesem Abend auf einen Schlag kassiert hat.
   */
  getBiggestSchlag(round: Round): { playerName: string; points: number; gameType: string } | null {
    let best: { playerName: string; points: number; gameType: string } | null = null;

    round.games.forEach(game => {
      game.scores.forEach(score => {
        if (score.points <= 0 || (best && score.points <= best.points)) return;
        const player = round.players.find(p => p.id === score.playerId);
        best = { playerName: player?.firstName ?? '?', points: score.points, gameType: game.gameType };
      });
    });

    return best;
  }

  neueRundeStarten(): void {
    const neueRunde = createEmptyRound(); // erstmal ohne Spieler
    this.roundService.createRound(neueRunde).subscribe({
      next: (response) => {
        console.log('Neue Runde erstellt:', response.round);
        this.rounds.push(response.round);
        this.displayedColumns = this.getDynamicColumns();
        this.goToRound(response.round);
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

