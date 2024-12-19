import { PlayerPoints } from './../models/Game';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Game } from '../models/Game';
import { Person } from '../person.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent {

     // Spieler
  persons: Person[] = [
    new Person(1, 'Vogl'),
    new Person(2, 'Paul'),
    new Person(3, 'Manu'),
    new Person(4, 'Wolle')
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
  pointsInput: number = 20;
  maxWinners: number = 2; // Standardmäßig 2 Gewinner
  dataSource: MatTableDataSource<Game> = new MatTableDataSource()

  constructor(private cdr: ChangeDetectorRef){}

  // Funktion zum Setzen der maximalen Anzahl der Gewinner
  setMaxWinners(winnerType: string) {
    switch (winnerType) {
      case 'Solo':
        this.maxWinners = 1;
        break;
      case 'Geier':
        this.maxWinners = 2;
        break;
      case 'Wenz':
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
    if(this.inputString != null){
      this.inputString += this.pointsInput.toString() + value.toString();
      this.pointsInput += Number(this.inputString);
    }
    else{
      this.pointsInput = 0;
    }

  }

  // Spiel hinzufügen
  addGame() {
    if (this.selectedWinners.length !== this.maxWinners || this.pointsInput <= 0) {
      alert(`Bitte genau ${this.maxWinners} Gewinner auswählen und Punkte eingeben.`);
      return;
    }

    // Punkte berechnen
    const currentPoints: PlayerPoints = {};


    this.persons.forEach(person => {
      const name = person.name;
      if (this.selectedWinners.includes(name)) {
        currentPoints[name] = this.pointsInput; // Gewinner bekommen Punkte
      } else {
        currentPoints[name] = -this.pointsInput; // Verlierer verlieren Punkte
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
    this.pointsInput = 20;
  }
}
