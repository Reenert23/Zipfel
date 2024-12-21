import { PlayerPoints } from './../models/Game';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Game } from '../models/Game';
import { Person } from '../person.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NameDialogComponent } from '../name-dialog/name-dialog.component';
import { RamschDialogComponent } from '../ramsch-dialog/ramsch-dialog.component';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent {

     // Spieler
  persons: Person[] = [
    new Person(1, 'Kaddler 1'),
    new Person(2, 'Kaddler 2'),
    new Person(3, 'Kaddler 3'),
    new Person(4, 'Kaddler 4')
  ];

  displayedColumns: string[] = ['game', ...this.persons.map(person => person.name)];

  // Punkte aller Spieler kumulativ
  totalPoints: PlayerPoints = {
    Vogl: 0,
    Paul: 0,
    Manu: 0,
    Wolle: 0
  };

  // Liste der Spiele
  games: Game[] = [];

  // Temporäre Auswahl der Gewinner
  selectedWinners: string[] = [];
  inputString: string = "";
  pointsInput: number = 0;
  maxWinners: number = 2; // Standardmäßig 2 Gewinner
  dataSource: MatTableDataSource<Game> = new MatTableDataSource()
  playerNames: string[] = [];
  isSetupComplete = false;
  clickCount: number = 0;
  isLooser: boolean = false;
  winnerType: string = '';

  constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog){}

  openNameDialog(): void {
    const dialogRef = this.dialog.open(NameDialogComponent, {
      width: '400px',
      data: { playerNames: this.playerNames }
    });

    dialogRef.afterClosed().subscribe((result: string[] | undefined) => {
      if (result && result.length === 4) {
        this.updatePlayers(result);
        this.games = [];
        this.dataSource = new MatTableDataSource();
        this.isSetupComplete = true;
      }
    });
  }

  openRamschDialog(): void {
    const dialogRef = this.dialog.open(RamschDialogComponent, {
      width: '400px',
      data: { persons: this.persons }
    });

    const currentPoints: PlayerPoints = {};

    dialogRef.afterClosed().subscribe((result: string[] | undefined) => {
      console.log(result);
      if (result && result.length === 4) {
        this.persons.forEach((person, index) => {
          currentPoints[person.name] = parseInt(result[index]);
        });
        console.log(currentPoints);
        const newGame = new Game(this.games.length + 1, { ...currentPoints });
        this.games.push(newGame);
        this.dataSource = new MatTableDataSource<Game>(this.games);
        this.totalPoints = this.getTotalPoints();
      }
    });
  }

  updatePlayers(playerNames: string[]): void {
    // 1. Spieler aktualisieren
    this.persons = playerNames.map((name, index) => new Person(index + 1, name));

    // 2. Tabellenspalten anpassen
    this.displayedColumns = ['game', ...this.persons.map(person => person.name)];

    // 3. Punkte-Objekt initialisieren
    this.totalPoints = {};
    for (const name of playerNames) {
      this.totalPoints[name] = 0;
    }
  }


  // Funktion zum Setzen der maximalen Anzahl der Gewinner
  setMaxWinners(winnerType: string) {
    this.winnerType = winnerType;
    switch (winnerType) {
      case 'Solo':
        this.clickCount++;
        this.maxWinners = 1;
        this.isLooser = this.clickCount % 2 === 0;
        break;
      case 'Ruf':
        this.clickCount = 0;
        this.maxWinners = 2;
        break;
      case 'Geier':
        this.clickCount = 0;
        this.maxWinners = 2;
        break;
      case 'Ramsch':
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

    // Gesamtpunkte für die letzte Zeile berechnen
  getTotalPoints() {
    const points: { [key: string]: number } = {};

    // Für jedes Spiel, füge die Punkte für jeden Spieler hinzu
    this.games.forEach(game => {
      this.persons.forEach(person => {
        points[person.name] = (points[person.name] || 0) + (game.points[person.name] || 0);
      });
    });

    return points;
  }

  addToInput(value: number) {
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
    alert("Der letzte Eintrag wird gelöscht!")
    this.games.pop();
    this.dataSource = new MatTableDataSource<Game>(this.games);
    this.totalPoints = this.getTotalPoints();
  }

  addGame() {
    if (this.selectedWinners.length !== this.maxWinners || this.pointsInput <= 0) {
      alert(`Bitte genau ${this.maxWinners} Gewinner auswählen und Punkte eingeben.`);
      return;
    }
    const currentPoints: PlayerPoints = {};

    this.persons.forEach(person => {
      const name = person.name;

      if (this.maxWinners === 1) {
        // Nur ein Gewinner: Der erste in der Liste der Gewinner erhält die Punkte
        if (this.selectedWinners.includes(name)) {
          if (this.selectedWinners.indexOf(name) === 0) {
            currentPoints[name] = this.pointsInput;
          } else {
            currentPoints[name] = 0;
          }
        } else {
          currentPoints[name] = -Math.floor(this.pointsInput / 3); // Verlierer verlieren 1/3 der Punkte
        }

        // Bedingung hinzufügen, falls isLooser === true
        if (this.isLooser) {
          currentPoints[name] *= -1; // Multipliziere die Punkte mit -1
        }
      } else {
        // Mehrere Gewinner: normale Punkteverteilung
        if (this.selectedWinners.includes(name)) {
          currentPoints[name] = this.pointsInput; // Gewinner  +Punkte
        } else {
          currentPoints[name] = -this.pointsInput; // Verlierer -Punkte
        }
      }

    });

    // Neues Spiel hinzufügen
    const newGame = new Game(this.games.length + 1, { ...currentPoints });
    this.games.push(newGame);
    this.dataSource = new MatTableDataSource<Game>(this.games);

    // Manuelles Triggern der Änderungserkennung
    this.cdr.detectChanges();
    console.log(JSON.stringify(this.games));

    // Update kumulative Punkte
    this.totalPoints = this.getTotalPoints();

    // Reset für nächste Runde
    this.selectedWinners = [];
    this.maxWinners = 2;
    this.clickCount = 0;
    this.clearInput();
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

}
