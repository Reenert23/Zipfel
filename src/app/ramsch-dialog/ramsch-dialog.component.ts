import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Person } from '../person.model';

@Component({
  selector: 'app-ramsch-dialog',
  templateUrl: './ramsch-dialog.component.html',
  styleUrls: ['./ramsch-dialog.component.css']
})
export class RamschDialogComponent {
  persons: Person[] = [
    new Person(1, 'John Doe'),
    new Person(2, 'Jane Smith'),
    new Person(3, 'Jake Johnson'),
    new Person(4, 'Jill Taylor')
  ];
  numbers: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<RamschDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.persons = this.data.persons;
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
