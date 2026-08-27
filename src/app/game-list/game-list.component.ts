import { GameService } from './../services/game.service';
import { Game, GameScore } from './../models/Game';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Player } from '../models/Player';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NameDialogComponent } from '../name-dialog/name-dialog.component';
import { RamschDialogComponent } from '../ramsch-dialog/ramsch-dialog.component';
import { RoundService } from '../services/round.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Round } from '../models/Round';
import { SelectPlayersComponent } from '../dialogs/select-players/select-players.component';
import { KassensturzComponent } from '../dialogs/kassensturz/kassensturz.component';
import { TeilenComponent } from '../dialogs/teilen/teilen.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { ToolbarService } from '../services/toolbar.service';
import { WriterTokenService } from '../services/writer-token.service';
import { SpectatorChoiceService } from '../services/spectator-choice.service';
import { PushService, PushHindernis } from '../services/push.service';
import { formatCents } from '../services/settlement';
import { distribute, imbalance } from '../services/balance';


@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  // Spieler für die Logik (immer gültig)
  players: Player[] = [];

  // Slots für das UI (können leer sein → Buttons sichtbar)
  playerSlots: (Player | undefined)[] = [undefined, undefined, undefined, undefined];

  displayedColumns: string[] = ['game', ...this.players.map(player => player.firstName)];

  // Punkte aller Spieler kumulativ
  totalPoints: { [playerId: number]: number } = {};


  // Liste der Spiele
  games: Game[] = [];

  /* Anzeigereihenfolge der Tabelle, unabhaengig von games: games bleibt immer
     aufsteigend nach id (das braucht deleteLastGame() fuer "letztes Spiel"
     und getGameNumber()/isGeber() fuer stabile Nummern), nur die Tabelle
     dreht sich beim Tippen auf den Spiel-Header um. */
  sortNewestFirst = false;

  newRound: Round = {
    players: this.players, // Da players ein Pflichtfeld ist, muss es initialisiert werden.
    games: [],    // Optional: Kann auch weggelassen werden, wenn nicht erforderlich.
    lockedPlayers: false,
    date: new Date().toISOString()
  };

  // Temporäre Auswahl der Gewinner
  selectedWinners: string[] = [];
  inputString: string = "";
  lastAddedGameId: number = 0;
  /* Sperrt den OK-Button zwischen Tap und Serverantwort. Ohne das schickte ein
     ungeduldiger zweiter Tap - z.B. waehrend der Render-Server nach einer
     Ruhephase erst noch hochfaehrt - dasselbe Spiel doppelt los. */
  isSaving = false;
  pointsInput: number = 0;
  maxWinners: number = 2; // Standardmäßig 2 Gewinner
  dataSource: MatTableDataSource<Game> = new MatTableDataSource()
  playerNames: string[] = [];
  isSetupComplete = false;
  clickCount: number = 0;
  isLooser: boolean = false;
  soloCaller: number = -1;
  winnerType: string = '';
  gameType: string = '';
  geber: boolean = true;
  round?: Round;
  geberStartIndex = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private gameService: GameService,
    private roundService: RoundService,
    private router: Router,
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private writerTokenService: WriterTokenService,
    private spectatorChoice: SpectatorChoiceService,
    private pushService: PushService
    ){}

  /** Gewaehlter Spieler des Mitlesers; null, solange er noch nicht gewaehlt hat. */
  spectatorPlayerId: number | null = null;

  readonly formatCents = formatCents;

    ngOnInit(): void {
      this.toolbarService.openPlayerSelector$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.openPlayerSelector());

      this.route.paramMap
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          const id = Number(params.get('id'));
          if (!id) return;

          this.roundService.getRoundById(id).subscribe((runde) => {
          this.newRound = {
            ...runde,
            lockedPlayers: (runde.games && runde.games.length > 0)
          };

          if (runde.players) {
            this.players = runde.players;

            // ✅ Buttons aktualisieren
            this.playerSlots = [
              ...this.players,
              ...Array(4 - this.players.length).fill(undefined)
            ];
          }

          this.games = runde.games || [];
          this.totalPoints = this.getTotalPoints();

          /* Nur fuer Mitleser relevant, und erst hier auswertbar: ob jemand
             Zuschauer ist, steht erst fest, wenn die Runde geladen ist. Eine
             Wahl auf einen Spieler, der gar nicht mehr mitspielt, wird
             verworfen - die Besetzung wechselt von Runde zu Runde. */
          const gewaehlt = this.spectatorChoice.getPlayer(id);
          this.spectatorPlayerId =
            gewaehlt !== null && this.players.some(p => p.id === gewaehlt) ? gewaehlt : null;

            // Tabelle aktualisieren
            this.dataSource.data = this.orderedGames();
            this.displayedColumns = ['game', ...this.players.map(p => p.firstName)];
          });
        });
    }

  openNameDialog(): void {
    const dialogRef = this.dialog.open(NameDialogComponent, {
      width: '400px',
      data: { playerNames: this.playerNames }
    });

    dialogRef.afterClosed().subscribe((result: string[] | undefined) => {
      if (result && result.length === 4) {
        this.updatePlayers(result);
        this.newRound.players = this.players;
        this.games = [];
        this.dataSource = new MatTableDataSource();
        this.isSetupComplete = true;
      }
    });

  }

  openRamschDialog(): void {
    if (this.isFinished || this.isSpectator) return;
    const dialogRef = this.dialog.open(RamschDialogComponent, {
      width: '400px',
      data: { players: this.players }
    });

    dialogRef.afterClosed().subscribe((result: string[] | undefined) => {
      /* Vor der Auswertung, und bewusst auch beim Abbrechen: schon der Tipp auf
         "Ramsch" hat maxWinners auf 3 gestellt, dieser Zustand ist mit dem
         Schliessen des Dialogs hinfaellig. */
      this.resetEingabe();

      if (result && result.length === this.players.length) {
        const scores: GameScore[] = this.players.map((player, index) => ({
          playerId: player.id,
          points: parseInt(result[index], 10) || 0
        }));

        const newGame: Game = {
          gameType: "Ramsch",
          soloCaller: null,
          scores: scores,
          roundId: this.newRound.id
        };

        if (this.newRound.id === undefined) {
          // Erstes Spiel der Runde: Runde muss erst angelegt werden, bevor ein
          // Spiel hinzugefügt werden kann (siehe addGame()/addGameToRound()).
          this.roundService.createRound(this.newRound).subscribe((response) => {
            this.newRound = response.round;
            newGame.roundId = response.round.id;
            this.saveRamschGame(newGame);
          });
        } else {
          this.saveRamschGame(newGame);
        }
      }
    });
  }

  /**
   * Hinweis beim Eintippen eines Solos, wenn der Betrag nicht glatt auf die
   * Gegenspieler aufgeht.
   *
   * Beim Schafkopf rechnet der Alleinspieler mit jedem Gegner einzeln ab, ein
   * Solo ist also das Dreifache eines Tarifs und damit von Haus aus durch drei
   * teilbar. Steht hier ein krummer Betrag, ist das meist ein Vertipper oder
   * jemand hat den Tarif statt der Summe eingegeben.
   *
   * Es wird nur hingewiesen, nicht abgelehnt: die Runde geht dank der
   * Restverteilung trotzdem auf, und wer den Betrag so will, soll ihn
   * eintragen koennen. Der Hinweis zeigt deshalb gleich, was herauskommt.
   */
  get soloRestHinweis(): string | null {
    if (this.maxWinners !== 1) {
      return null;
    }

    const betrag = Math.abs(Number(this.pointsInput));
    if (!Number.isFinite(betrag) || betrag <= 0) {
      return null;
    }

    const gegenspieler = this.players.length - 1;
    if (gegenspieler < 1 || betrag % gegenspieler === 0) {
      return null;
    }

    const anteile = distribute(betrag, gegenspieler);
    return `${betrag} geht nicht glatt durch ${gegenspieler}. Die Gegenspieler zahlen ${anteile.join(', ')}.`;
  }

  /**
   * Nimmt ein Spiel nicht an, das nicht auf 0 aufgeht, und sagt warum.
   *
   * Beim Eintragen ist so ein Fehler noch einem Spiel zuzuordnen. Faellt er
   * erst beim Kassensturz am Ende des Abends auf, weiss niemand mehr, welches
   * Spiel gemeint war - deshalb steht die Pruefung hier und nicht nur dort.
   *
   * Ruf und Solo gehen nach ihrer Rechnung immer auf und der Ramsch wird
   * schon in seinem Dialog geprueft; das hier ist die Zusicherung, dass keine
   * kuenftige Spielart daran vorbei in die Runde kommt.
   */
  private refuseUnbalanced(scores: GameScore[]): boolean {
    const fehlbetrag = imbalance(scores);
    if (fehlbetrag === 0) {
      return false;
    }

    alert(
      `Das Spiel geht nicht auf: die Beträge ergeben zusammen ${fehlbetrag} statt 0. ` +
      `Ein Spiel verteilt nur um - es kommt kein Geld dazu und es verschwindet keines.`
    );
    return true;
  }

  private saveRamschGame(newGame: Game): void {
    if (this.newRound.id === undefined) return;
    if (this.refuseUnbalanced(newGame.scores)) return;

    this.roundService.addGameToRound(this.newRound.id, newGame).subscribe({
      next: (updatedRound) => {
        this.games = updatedRound.games || [];
        this.newRound = updatedRound;

        if (updatedRound.games && updatedRound.games.length > 0) {
          const lastElement = updatedRound.games[updatedRound.games.length - 1];
          this.lastAddedGameId = lastElement?.id ?? 0;
        }

        this.newRound.lockedPlayers = true;
        this.dataSource = new MatTableDataSource<Game>(this.orderedGames());
        this.totalPoints = this.getTotalPoints();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.handleWriteError(error, 'Error adding Ramsch game:');
      }
    });
  }

  get isFinished(): boolean {
    return this.newRound.status === 'FINISHED';
  }

  /**
   * Zuschauer ist, wer eine geschuetzte Runde offen hat, fuer die auf diesem
   * Geraet kein Token liegt - egal ob ueber einen geteilten Link oder ganz
   * normal aus der Rundenliste heraus. Beides ist derselbe Fall.
   *
   * writerProtected muss mitgeprueft werden: Runden von vor der
   * Token-Einfuehrung haben keinen Schreiber, dort darf laut Server jeder
   * eintragen - die duerfen nicht faelschlich als Zuschauer-Ansicht landen.
   */
  get isSpectator(): boolean {
    if (this.newRound.id === undefined || !this.newRound.writerProtected) {
      return false;
    }
    return this.writerTokenService.getToken(this.newRound.id) === null;
  }

  /**
   * Nur das Geraet, das die Runde angelegt hat, haelt ihr Token - und nur dort
   * gehoert der Mitlesen-Schalter hin.
   *
   * Bewusst nicht ueber isSpectator gebaut: bei abgeschaltetem Mitlesen ist
   * writerProtected false, damit waere isSpectator fuer alle false und der
   * Schalter liesse sich nicht mehr zurueckdrehen.
   */
  get istSchreiber(): boolean {
    return this.newRound.id !== undefined
      && this.writerTokenService.getToken(this.newRound.id) !== null;
  }

  get mitlesenAus(): boolean {
    return this.newRound.mitlesenAus === true;
  }

  mitlesenWirdUmgeschaltet = false;

  mitlesenUmschalten(): void {
    const id = this.newRound.id;
    if (id === undefined || this.mitlesenWirdUmgeschaltet) return;

    this.mitlesenWirdUmgeschaltet = true;
    this.roundService.setMitlesen(id, !this.mitlesenAus).subscribe({
      next: runde => {
        /* Nur die beiden Schalterfelder uebernehmen: die Antwort enthaelt zwar
           die ganze Runde, aber lockedPlayers wird hier lokal gefuehrt und
           ginge beim Durchreichen verloren. */
        this.newRound = {
          ...this.newRound,
          mitlesenAus: runde.mitlesenAus,
          writerProtected: runde.writerProtected
        };
        this.mitlesenWirdUmgeschaltet = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Mitlesen umschalten fehlgeschlagen:', err);
        this.mitlesenWirdUmgeschaltet = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Erst die Frage "wer bist du?", danach der Zwischenstand. */
  get needsSpectatorChoice(): boolean {
    return this.isSpectator && this.spectatorPlayerId === null && this.players.length > 0;
  }

  chooseSpectatorPlayer(playerId: number): void {
    this.spectatorPlayerId = playerId;
    if (this.newRound.id !== undefined) {
      this.spectatorChoice.setPlayer(this.newRound.id, playerId);
      // Laufen schon Benachrichtigungen, gelten sie ab jetzt dem neuen Spieler.
      if (this.pushAn) {
        this.pushService.spielerWechseln(this.newRound.id, playerId);
      }
    }
  }

  /** Laufen fuer diese Runde bereits Benachrichtigungen auf diesem Geraet? */
  get pushAn(): boolean {
    return this.newRound.id !== undefined && this.pushService.istAngemeldet(this.newRound.id);
  }

  /** Nur anbieten, wo es auch gehen kann - sonst steht da ein toter Knopf. */
  get pushMoeglich(): boolean {
    return this.isSpectator && this.pushService.moeglich && !this.pushAn;
  }

  pushHinweis: string | null = null;

  async pushEinschalten(): Promise<void> {
    if (this.newRound.id === undefined || this.spectatorPlayerId === null) return;

    const hindernis = await this.pushService.anmelden(this.newRound.id, this.spectatorPlayerId);
    this.pushHinweis = hindernis === null ? null : this.hinweisZu(hindernis);
    this.cdr.detectChanges();
  }

  async pushAusschalten(): Promise<void> {
    if (this.newRound.id === undefined) return;

    await this.pushService.abmelden(this.newRound.id);
    this.pushHinweis = null;
    this.cdr.detectChanges();
  }

  private hinweisZu(hindernis: PushHindernis): string {
    switch (hindernis) {
      case 'kein-service-worker':
        return 'Benachrichtigungen gehen in diesem Browser nicht. Auf dem iPhone muss die App dafür über "Zum Home-Bildschirm" installiert sein.';
      case 'nicht-konfiguriert':
        return 'Benachrichtigungen sind auf dem Server noch nicht eingerichtet.';
      case 'abgelehnt':
        return 'Du hast Benachrichtigungen für diese Seite abgelehnt. Das lässt sich nur in den Browser-Einstellungen wieder ändern.';
      default:
        return 'Das hat nicht geklappt. Später nochmal versuchen.';
    }
  }

  /** Zurueck zur Auswahl, falls das Handy weitergereicht wurde. */
  resetSpectatorChoice(): void {
    this.spectatorPlayerId = null;
    if (this.newRound.id !== undefined) {
      this.spectatorChoice.clearPlayer(this.newRound.id);
    }
  }

  /** Die Runde hat keinen Namen, nur ein Datum - das ist hier die Ueberschrift. */
  get roundTitle(): string {
    if (!this.newRound.date) {
      return 'Runde';
    }
    return new Date(this.newRound.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  }

  initials(player: Player): string {
    return (player.firstName || '?').charAt(0).toUpperCase();
  }

  finishRound(): void {
    if (this.newRound.id === undefined) return;
    this.roundService.finishRound(this.newRound.id).subscribe({
      next: (updated) => {
        this.newRound = { ...this.newRound, status: updated.status };
      },
      error: (err) => this.handleWriteError(err, 'Fehler beim Beenden der Runde:')
    });
  }

  reopenRound(): void {
    if (this.newRound.id === undefined) return;
    this.roundService.reopenRound(this.newRound.id).subscribe({
      next: (updated) => {
        this.newRound = { ...this.newRound, status: updated.status };
      },
      error: (err) => this.handleWriteError(err, 'Fehler beim Wiederöffnen der Runde:')
    });
  }

  /**
   * Schreibfehler sichtbar machen statt sie nur in die Konsole zu legen: 403
   * und 409 sind keine Programmfehler, sondern etwas, das der Tippende wissen
   * und beheben kann.
   */
  private handleWriteError(err: any, logPrefix: string): void {
    console.error(logPrefix, err);

    if (err?.status === 403) {
      alert('Dieses Gerät hat kein Schreibrecht für diese Runde. Eintragen kann nur, wer die Runde gestartet hat.');
    } else if (err?.status === 409) {
      alert('Diese Runde ist beendet. Zum Nachtragen bitte zuerst auf "Runde wieder öffnen".');
    }
  }

  private orderedGames(): Game[] {
    return this.sortNewestFirst ? [...this.games].reverse() : this.games;
  }

  toggleSort(): void {
    this.sortNewestFirst = !this.sortNewestFirst;
    this.dataSource.data = this.orderedGames();
  }

  getGameNumber(game: Game): number {
    return this.games.findIndex(g => g === game) + 1;
  }

  getGameIndex(game: Game): number {
    return this.games.indexOf(game); // basiert auf Reihenfolge im Array
  }

  // true, wenn player der Geber für dieses Spiel ist
  isGeber(game: Game, player: Player): boolean {
    const gi = this.getGameIndex(game);
    if (gi < 0) return false;
    const dealerIndex = (this.geberStartIndex + gi) % this.players.length;
    return this.players[dealerIndex]?.id === player.id;
  }


  updatePlayers(playerNames: string[]): void {
    // 1. Spieler für Logik setzen
    this.players = playerNames.map((name, index) => ({
      id: index + 1,
      firstName: name,
      lastName: '',
      nickname: ''
    }));

    // 2. Slots befüllen (leere Slots auffüllen mit undefined)
    this.playerSlots = [
      ...this.players,
      ...Array(4 - this.players.length).fill(undefined)
    ];
  }

  // Funktion zum Setzen der maximalen Anzahl der Gewinner
  setMaxWinners(winnerType: string) {
    this.winnerType = winnerType;
    switch (winnerType) {
      case 'Solo':
        this.gameType = winnerType;
        this.clickCount++;
        this.maxWinners = 1;
        this.isLooser = this.clickCount % 2 === 0;
        break;
      case 'Ruf':
        this.gameType = winnerType;
        this.clickCount = 0;
        this.maxWinners = 2;
        break;
      case 'Geier':
        this.clickCount = 0;
        this.maxWinners = 2;
        break;
      case 'Ramsch':
        this.gameType = winnerType;
        this.clickCount = 0;
        this.maxWinners = 3;
        break;
      default:
        this.maxWinners = 2;
    }
    // Reset die Gewinnerauswahl bei Änderung der maximalen Anzahl
    this.selectedWinners = [];
  }

  // Gewinner auswählen
  toggleWinner(name: string) {
    if (this.selectedWinners.includes(name)) {
      this.selectedWinners = this.selectedWinners.filter(w => w !== name);
    } else if (this.selectedWinners.length < this.maxWinners) {
      this.selectedWinners.push(name);
    }
  }

  /**
   * Zeigt, wer wem am Ende der Runde was schuldet. Rein lesend - der Dialog
   * rechnet nur mit den Ständen, die hier ohnehin schon geführt werden, und
   * ändert nichts an der Runde.
   */
  openKassensturz(): void {
    this.dialog.open(KassensturzComponent, {
      width: '400px',
      maxHeight: '80vh',
      data: { players: this.players, totalPoints: this.totalPoints }
    });
  }

  /**
   * Der Link zeigt auf genau diese Runde, nicht auf "die neueste": bei bis zu
   * zehn Leuten in wechselnden Konstellationen koennen zwei Tische parallel
   * laufen, und dann fuehrt ein Automatismus die Mitleser an den falschen.
   */
  openTeilen(): void {
    if (this.newRound.id === undefined) return;
    this.dialog.open(TeilenComponent, {
      width: '360px',
      data: { url: `${window.location.origin}/rounds/${this.newRound.id}/games` }
    });
  }

  /**
   * Breiter als der Kassensturz: eine Kurve über einen ganzen Abend braucht
   * Platz in der Breite, eine Liste von Zahlungen nicht.
   *
   * Der Dialog wird erst hier geladen, nicht beim Start der App. chart.js
   * wiegt rund 200 kB und wuerde das Initial-Bundle sonst ueber die Grenze
   * schieben, ab der der Produktionsbuild abbricht - fuer eine Ansicht, die
   * an den meisten Abenden niemand aufmacht.
   */
  async openVerlauf(): Promise<void> {
    const { VerlaufComponent } = await import('../dialogs/verlauf/verlauf.component');

    this.dialog.open(VerlaufComponent, {
      width: '92vw',
      maxWidth: '560px',
      maxHeight: '80vh',
      data: { players: this.players, games: this.games }
    });
  }

    // Gesamtpunkte für die letzte Zeile berechnen
    getTotalPoints() {
      const totals: { [playerId: number]: number } = {};

      this.games.forEach(game => {
        game.scores.forEach(score => {
          totals[score.playerId] = (totals[score.playerId] || 0) + score.points;
        });
      });

      return totals;
    }

  /* Betraege sind Cent, fuenf Stellen sind also knapp 1.000 Euro fuer ein
     einzelnes Spiel - reichlich Luft nach oben. Ohne Grenze haengte addToInput
     jede Ziffer an, und ein verrutschter Daumen erzeugte neunstellige Summen:
     am 15.08.2026 landete so ein Spiel ueber 111112222 in Runde 22. */
  private static readonly MAX_EINGABE_STELLEN = 5;

  addToInput(value: number) {
    if (this.inputString.length >= GameListComponent.MAX_EINGABE_STELLEN) {
      return;
    }

    if (this.inputString === "") {
      this.inputString = value.toString(); // Erste Eingabe
    } else {
      this.inputString += value.toString(); // Concatenation der Eingaben
    }

    // Konvertiere den gesamten String in eine Zahl
    this.pointsInput = parseInt(this.inputString, 10);
  }

  clearInput() {
    this.inputString = ""; // Leert den String
    this.pointsInput = 0;  // Setzt die Zahl zurück
  }

  deleteLastGame() {
    if (this.isFinished || this.isSpectator) return;
    if (this.games.length === 0) {
      alert("Keine Spiele zum Löschen vorhanden!");
      return;
    }

    const lastGame = this.games[this.games.length - 1];
    if (!lastGame.id) {
      alert("Letztes Spiel hat keine ID!");
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: {
        title: 'Spiel löschen',
        message: `Spiel ${this.games.length} wirklich löschen?`,
        confirmText: 'Löschen'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) return;

      this.gameService.deleteGame(lastGame.id!, this.newRound.id!).subscribe({
        next: () => {
          // Lokal synchron halten
          this.games.pop();
          this.dataSource = new MatTableDataSource<Game>(this.orderedGames());
          this.totalPoints = this.getTotalPoints();
          console.log(`Spiel mit ID ${lastGame.id} gelöscht`);
        },
        error: (err) => {
          this.handleWriteError(err, 'Fehler beim Löschen des Spiels:');
        }
      });
    });
  }


  addGame() {
    if (this.isSaving || this.isFinished || this.isSpectator) return;
    this.isSaving = true;

    if (this.games.length === 0) {
      // Erstelle die Runde und warte auf das Ergebnis
      this.roundService.createRound(this.newRound).subscribe({
        next: (response) => {
          console.log("Runde gestartet: ", response.round);
          this.newRound = response.round; // Setze das Ergebnis auf newRound, sodass die ID jetzt verfügbar ist

          // Nachdem die Runde erfolgreich erstellt wurde, füge das neue Spiel hinzu
          this.addGameToRound(); // Eine Funktion, die den Spielhinzufügungsprozess behandelt
        },
        error: (error) => {
          this.handleWriteError(error, 'Error creating round:');
          this.isSaving = false;
        }
      });
    } else {
      // Wenn die Runde bereits existiert (d.h., Spiele sind schon vorhanden)
      this.addGameToRound(); // Spiel wird direkt hinzugefügt
    }
  }

  getPointsForPlayer(game: Game, playerId: number): number {
    return game.scores.find(s => s.playerId === playerId)?.points || 0;
  }

  getPointsForSoloCircle(game: Game, playerId: number): number {
    return game.scores.find(s => s.playerId === playerId)?.points || 0;
  }



  addGameToRound() {
    if (this.selectedWinners.length !== this.maxWinners || this.pointsInput <= 0) {
      alert(`Bitte genau ${this.maxWinners} Gewinner auswählen und Punkte eingeben.`);
      this.isSaving = false;
      return;
    }

    let scores: GameScore[];

    if (this.maxWinners === 1) {
      this.gameType = "Solo";

      const soloPlayer = this.players.find(p => this.selectedWinners.includes(p.firstName));
      this.soloCaller = soloPlayer?.id ?? -1;

      const soloAmount = this.isLooser ? -this.pointsInput : this.pointsInput;
      const opponents = this.players.filter(p => p.id !== this.soloCaller);

      /* Der Gegenbetrag wird auf die Gegenspieler aufgeteilt, statt ihn je
         Spieler abzurunden: bei 80 Cent zahlten drei Gegenspieler vorher je
         26, zusammen 78 - zwei Cent verschwanden aus der Runde und tauchten
         erst am Ende im Kassensturz wieder auf. */
      const shares = distribute(-soloAmount, opponents.length);

      scores = this.players.map(player => {
        if (player.id === this.soloCaller) {
          return { playerId: player.id, points: soloAmount };
        }
        return {
          playerId: player.id,
          points: shares[opponents.findIndex(o => o.id === player.id)]
        };
      });
    } else {
      this.gameType = "Ruf";
      scores = this.players.map(player => ({
        playerId: player.id,
        points: this.selectedWinners.includes(player.firstName)
          ? this.pointsInput
          : -this.pointsInput
      }));
    }

    if (this.refuseUnbalanced(scores)) {
      this.isSaving = false;
      return;
    }

    const newGame: Game = {
      gameType: this.gameType,
      soloCaller: this.soloCaller,
      scores: scores,
      roundId: this.newRound.id
    };

    if (this.newRound.id !== undefined) {
      this.roundService.addGameToRound(this.newRound.id, newGame).subscribe({
        next: (updatedRound) => {
          console.log("Game added to round:", updatedRound);

          // 👉 Hier statt push: Backend-Antwort übernehmen
          this.games = updatedRound.games || [];
          this.newRound = updatedRound; // Runde mit aktualisierten Games setzen

          // Letzte ID merken
          if (updatedRound.games && updatedRound.games.length > 0) {
            const lastElement = updatedRound.games[updatedRound.games.length - 1];
            this.lastAddedGameId = lastElement?.id ?? 0;
          }

          // Tabelle refresh
          this.newRound.lockedPlayers = true;
          this.dataSource = new MatTableDataSource<Game>(this.orderedGames());
          this.totalPoints = this.getTotalPoints();
          this.isSaving = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.handleWriteError(error, 'Error adding game to round:');
          this.isSaving = false;
        }
      });
    } else {
      this.isSaving = false;
    }

    this.resetEingabe();
  }

  /**
   * Setzt die Eingabemaske auf den Ausgangszustand zurueck.
   *
   * Lag frueher nur am Ende von addGameToRound(), der Ramsch-Weg hatte kein
   * Gegenstueck. "Ramsch" setzt aber ueber setMaxWinners() maxWinners auf 3,
   * und das blieb danach stehen - zusammen mit den getippten Ziffern und den
   * ausgewaehlten Gewinnern. Der naechste Druck auf OK machte daraus ein Spiel,
   * das niemand eintragen wollte; am 15.08.2026 sind so vier Fremdspiele in
   * Runde 22 gelandet (ids 93, 94, 97, 98).
   */
  private resetEingabe(): void {
    this.selectedWinners = [];
    this.maxWinners = 2;
    this.clickCount = 0;
    this.gameType = '';
    this.soloCaller = -1;
    this.clearInput();
  }




  saveAsRound(): void {
    if (this.games.length === 0) {
      alert('Es gibt keine Spiele, die als Round gespeichert werden können.');
      return;
    }
    this.newRound.players = this.players;
    this.newRound.games = this.games;

    this.roundService.createRound(this.newRound).subscribe(() => {
      console.log(this.newRound);
      alert('Round erfolgreich gespeichert!');
      this.games = []; // Spieleliste zurücksetzen
      this.dataSource = new MatTableDataSource();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToRounds(): void {
    this.router.navigate(['/rounds']);
  }


  getGridArea(index: number): string {
    // Manuelle Zuordnung für Uhrzeigersinn
    const gridAreas = [
      '1 / 1', // Spalte 1, Zeile 1
      '1 / 2', // Spalte 2, Zeile 1
      '2 / 2', // Spalte 2, Zeile 2
      '2 / 1', // Spalte 1, Zeile 2
    ];

    return gridAreas[index % gridAreas.length]; // Für mehr als 4 Spieler wiederholt sich das Muster.
  }

  openPlayerSelector(): void {
    console.log(this.newRound.lockedPlayers);
    if (this.isSpectator) {
      alert("Du schaust bei dieser Runde nur zu und kannst die Spieler nicht ändern.");
      return;
    }
    if (this.newRound.lockedPlayers) {
      alert("Spieler können nach Beginn der Runde nicht mehr geändert werden.");
      return;
    }

    const dialogRef = this.dialog.open(SelectPlayersComponent, {
      width: '420px',
      data: { preselected: this.players, requiredCount: 4 },
      maxHeight: '80vh',      // sorgt dafür, dass der Inhalt nicht höher als der Viewport wird
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((chosen: Player[] | undefined) => {
      if (!chosen || chosen.length !== 4) return;

      // 1) Spieler für Logik setzen
      this.players = chosen;

      // 2) Slots für die Buttons aktualisieren
      this.playerSlots = [
        ...this.players,
        ...Array(4 - this.players.length).fill(undefined)
      ];

      // 3) Spalten neu aufbauen
      this.displayedColumns = ['game', ...this.players.map(p => p.firstName)];

      // 4) Runde vorbereiten
      this.newRound.players = this.players;

      // 5) Tabelle zurücksetzen (neue Runde → keine Games)
      this.games = [];
      this.totalPoints = this.getTotalPoints();
      this.dataSource.data = this.orderedGames();

      this.isSetupComplete = true;
    });
  }

}
