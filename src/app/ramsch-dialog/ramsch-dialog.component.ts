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
  numbers: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<RamschDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.players = this.data.players;
  }

  onCancel(): void {
    this.dialogRef.close(); // Schließt das Popup
  }

  onSave(): void {
    for (let i = 0; i < 3; i++) {
      if (this.numbers[i] == null) { // Prüft auf null oder undefined
        this.numbers[i] = 0;
      }
    }
    this.numbers = this.numbers.concat(Array(4 - this.numbers.length).fill(0)); // [1, -1, 0, 0]

    const isSumZero = this.numbers.reduce((sum, num) => sum + Number(num), 0) === 0;
    console.log(this.numbers)


    if(!isSumZero){
      alert('Summe der 4 Felder muss 0 ergeben');
      return;
    }
    else{
      this.dialogRef.close(this.numbers);
    }

  }
}
