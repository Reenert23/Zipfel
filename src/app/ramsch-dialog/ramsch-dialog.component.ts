import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from '../models/Player';

@Component({
  selector: 'app-ramsch-dialog',
  templateUrl: './ramsch-dialog.component.html',
  styleUrls: ['./ramsch-dialog.component.css']
})
export class RamschDialogComponent {
  players: Player[] = [
    { id: 1, firstName: 'Kaddler 1', lastName: '', nickname: '' },
    { id: 2, firstName: 'Kaddler 2', lastName: '', nickname: '' },
    { id: 3, firstName: 'Kaddler 3', lastName: '', nickname: '' },
    { id: 4, firstName: 'Kaddler 4', lastName: '', nickname: '' }
  ];
  /* Als Text gefuehrt, nicht als number: so kann ein Feld voruebergehend nur
     "-" enthalten, wenn das Vorzeichen vor der Zahl gesetzt wird. Ein
     type="number"-Feld verwirft so einen Zwischenstand und liefert null.
     Der Aufrufer parst ohnehin mit parseInt(). */
  numbers: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<RamschDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.players = this.data.players;
  }

  isNegative(i: number): boolean {
    return (this.numbers[i] ?? '').startsWith('-');
  }

  /* Schaltet das Minus als Zeichen im Feld um - dadurch ist die Reihenfolge
     egal: erst tippen und dann umschalten geht genauso wie umgekehrt, wo aus
     dem leeren Feld ein "-" wird, das die folgenden Ziffern uebernehmen. */
  toggleSign(i: number): void {
    const value = this.numbers[i] ?? '';
    this.numbers[i] = value.startsWith('-') ? value.slice(1) : '-' + value;
  }

  /* Leer, "-" allein oder Vertipptes zaehlt als 0, damit ein halb ausgefuelltes
     Feld die Summenpruefung nicht auf NaN laufen laesst. */
  private toNumber(value: string | undefined): number {
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  onCancel(): void {
    this.dialogRef.close(); // Schließt das Popup
  }

  onSave(): void {
    /* Ueber players.length, nicht ueber eine feste 4: die Schleife lief vorher
       nur bis 2 und liess das vierte Feld undefiniert. */
    const values = this.players.map((_, i) => this.toNumber(this.numbers[i]));

    /* Lauter Nullen ergeben in Summe ebenfalls 0 und kamen deshalb durch die
       Pruefung darunter - ein leer abgeschickter Dialog legte so ein Spiel aus
       vier Nullen an. Am 15.08.2026 genau einmal passiert (Spiel 95). */
    if (values.every(value => value === 0)) {
      alert('Es ist nichts eingetragen — bitte die Punkte eingeben oder abbrechen.');
      return;
    }

    const sum = values.reduce((total, value) => total + value, 0);
    if (sum !== 0) {
      alert(`Die Summe muss 0 ergeben, ist aber ${sum > 0 ? '+' : ''}${sum}.`);
      return;
    }

    this.dialogRef.close(values.map(String));
  }
}
